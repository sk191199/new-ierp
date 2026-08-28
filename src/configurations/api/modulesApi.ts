import { API_ENDPOINTS, http, unwrapData } from "@/configurations/api/api";
import type { MetadataModule } from "@/models/metadata/metadata";
import { settingsSlug } from "@/pages/Settings/settingsCatalog";

export const MODULES_UPDATED_EVENT = "ierp.modules-updated";

interface MetadataModulesResponse {
  success: boolean;
  data?: MetadataModule[];
  message?: string;
}

export interface DynamicModuleEntity {
  id: string;
  moduleId: string;
  moduleCode?: string | null;
  entityName?: string | null;
  displayName?: string | null;
  isActive: boolean;
  apiBasePath?: string | null;
  fields?: unknown[] | null;
}

export interface DynamicModule {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  entities: DynamicModuleEntity[];
}

interface DynamicModulesResponse {
  success: boolean;
  data?: DynamicModule[];
  message?: string;
}

export interface CreateDynamicModuleEntityPayload {
  entityName: string;
  displayName: string;
  isActive: boolean;
}

interface DynamicModuleEntityResponse {
  success: boolean;
  data?: DynamicModuleEntity;
  message?: string;
}

export const getModules = async (): Promise<MetadataModule[]> => {
  const response = await http.get<MetadataModulesResponse>(API_ENDPOINTS.metadata.modules);
  return unwrapData<MetadataModule[]>(response.data);
};

export const getSettingsModules = getModules;

const normalizeKey = (value: string): string => value.trim().toLowerCase();

const screenKey = (screen: { id?: string; code?: string; name: string }): string =>
  normalizeKey(screen.id ?? screen.code ?? screen.name);

const moduleKey = (module: { id?: string; code?: string; name: string }): string =>
  normalizeKey(module.code ?? module.name);

const normalizeDynamicModule = (module: DynamicModule): MetadataModule | null => {
  if (!module.name?.trim() || !module.isActive) {
    return null;
  }

  return {
    id: module.id,
    code: module.code || settingsSlug(module.name),
    name: module.name.trim(),
    description: module.description ?? undefined,
    isActive: true,
    source: "dynamic",
    screens: (module.entities ?? [])
      .filter((entity) => entity.isActive && Boolean(entity.entityName || entity.displayName))
      .map((entity) => ({
        id: entity.id,
        code: entity.entityName ?? settingsSlug(entity.displayName ?? ""),
        name: entity.displayName ?? entity.entityName ?? "",
        route: `/settings/catalog/${settingsSlug(module.name)}/${settingsSlug(entity.displayName ?? entity.entityName ?? "")}`,
        entityName: entity.entityName ?? settingsSlug(entity.displayName ?? ""),
        apiBasePath: entity.apiBasePath ?? "",
        moduleId: entity.moduleId,
      })),
  };
};

const getDynamicModules = async (): Promise<MetadataModule[]> => {
  const response = await http.get<DynamicModulesResponse>(API_ENDPOINTS.dynamicModules);
  return unwrapData<DynamicModule[]>(response.data)
    .map(normalizeDynamicModule)
    .filter((module): module is MetadataModule => module !== null);
};

export const createDynamicModuleEntity = async (
  moduleId: string,
  payload: CreateDynamicModuleEntityPayload,
): Promise<DynamicModuleEntity> => {
  const response = await http.post<DynamicModuleEntityResponse>(
    API_ENDPOINTS.dynamicModuleEntities(moduleId),
    payload,
  );
  return unwrapData<DynamicModuleEntity>(response.data);
};

const mergeScreens = (metadataScreens: MetadataModule["screens"], dynamicScreens: MetadataModule["screens"]) => {
  const merged = new Map<string, MetadataModule["screens"][number]>();
  [...metadataScreens, ...dynamicScreens].forEach((screen) => {
    const key = screenKey(screen);
    if (!merged.has(key)) {
      merged.set(key, screen);
    }
  });
  return [...merged.values()];
};

const mergeModules = (metadataModules: MetadataModule[], dynamicModules: MetadataModule[]): MetadataModule[] => {
  const merged = new Map<string, MetadataModule>();

  metadataModules.forEach((module) => {
    merged.set(moduleKey(module), module);
  });

  dynamicModules.forEach((module) => {
    const key = moduleKey(module);
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, module);
      return;
    }

    merged.set(key, {
      ...existing,
      screens: mergeScreens(existing.screens, module.screens),
    });
  });

  return [...merged.values()];
};

const loadModuleScreens = async (module: MetadataModule): Promise<MetadataModule> => {
  if (module.screens.length > 0 || module.source === "dynamic") {
    return module;
  }

  try {
    const response = await http.get<{ success: boolean; data?: MetadataModule["screens"]; message?: string }>(
      API_ENDPOINTS.metadata.screensByModule(module.id),
    );
    return { ...module, screens: unwrapData<MetadataModule["screens"]>(response.data) };
  } catch (error: unknown) {
    console.warn(`Failed to load screens for module ${module.name}.`, error);
    return module;
  }
};

export const getAllModules = async (): Promise<MetadataModule[]> => {
  const [metadataResult, dynamicResult] = await Promise.allSettled([getModules(), getDynamicModules()]);
  const metadataModules = metadataResult.status === "fulfilled" ? metadataResult.value : [];
  const dynamicModules = dynamicResult.status === "fulfilled" ? dynamicResult.value : [];

  if (metadataResult.status === "rejected") {
    console.warn("Failed to load metadata modules; continuing with dynamic modules.", metadataResult.reason);
  }
  if (dynamicResult.status === "rejected") {
    console.warn("Failed to load dynamic modules; continuing with metadata modules.", dynamicResult.reason);
  }
  if (metadataResult.status === "rejected" && dynamicResult.status === "rejected") {
    throw metadataResult.reason;
  }

  const mergedModules = mergeModules(metadataModules, dynamicModules);
  return Promise.all(mergedModules.map(loadModuleScreens));
};
