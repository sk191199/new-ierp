import { API_ENDPOINTS, http, unwrapData } from "@/configurations/api/api";
import type { MetadataModule, MetadataModuleScreen } from "@/models/metadata/metadata";
import { getAllModules, getSettingsModules, createDynamicModuleEntity, MODULES_UPDATED_EVENT } from "./modulesApi";

interface SettingsMutationResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface CreateSettingsModulePayload {
  name: string;
}

const moduleCodeFromName = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export interface CreateSettingsScreenPayload {
  moduleId: string;
  name: string;
}

export const getSettingsScreens = async (
  module: MetadataModule,
): Promise<MetadataModuleScreen[]> => {
  if (module.screens.length > 0) {
    return module.screens;
  }

  const response = await http.get<SettingsMutationResponse<MetadataModuleScreen[]>>(
    API_ENDPOINTS.metadata.screensByModule(module.id),
  );
  return unwrapData<MetadataModuleScreen[]>(response.data);
};

export { createDynamicModuleEntity, getAllModules, getSettingsModules };

export const notifyModulesUpdated = (): void => {
  window.dispatchEvent(new Event(MODULES_UPDATED_EVENT));
};

export const createSettingsModule = async (
  payload: CreateSettingsModulePayload,
): Promise<MetadataModule> => {
  const response = await http.post<SettingsMutationResponse<MetadataModule>>(
    API_ENDPOINTS.metadata.createModule,
    { ...payload, code: moduleCodeFromName(payload.name) },
  );
  return unwrapData<MetadataModule>(response.data);
};

export const createSettingsScreen = async (
  payload: CreateSettingsScreenPayload,
): Promise<MetadataModuleScreen> => {
  const response = await http.post<SettingsMutationResponse<MetadataModuleScreen>>(
    API_ENDPOINTS.metadata.createScreen(payload.moduleId),
    { name: payload.name },
  );
  return unwrapData<MetadataModuleScreen>(response.data);
};