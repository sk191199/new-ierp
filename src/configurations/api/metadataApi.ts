import { API_ENDPOINTS, USE_MOCK, http, unwrapData, mockLatency } from "./api";
import type { CustomFieldDefinition, MetadataField, ScreenMetadata } from "@/models/metadata/metadata";
import { customerMasterMetadata } from "@/pages/Masters/customers.metadata.mock";

const mockCatalog: Record<string, ScreenMetadata> = {
  "customer-master": customerMasterMetadata,
};

const toField = (definition: CustomFieldDefinition): MetadataField => ({
  fieldKey: definition.fieldKey,
  label: definition.label,
  dataType: definition.dataType,
  controlType: definition.dataType === "boolean" ? "boolean" : "text",
  required: definition.isRequired,
  readOnly: false,
  visible: definition.isActive,
  width: 4,
  displayOrder: definition.displayOrder,
  isCustom: true,
});

/**
 * Custom fields are keyed by entity_name == screen code. The backend usually
 * merges them, but the client still merges as a safety net so a missing
 * metadata join cannot drop tenant extensions.
 */
export const mergeCustomFields = (
  metadata: ScreenMetadata,
  customFields: CustomFieldDefinition[] = [],
): ScreenMetadata => {
  const extras = customFields
    .filter((field) => field.entityName === metadata.screen.code && field.isActive)
    .map(toField);

  if (extras.length === 0) {
    return metadata;
  }

  const [first, ...rest] = metadata.sections;
  const existingKeys = new Set(metadata.sections.flatMap((section) => section.fields.map((field) => field.fieldKey)));
  const incoming = extras.filter((field) => !existingKeys.has(field.fieldKey));

  if (!first) {
    return {
      ...metadata,
      sections: [
        {
          code: "custom",
          title: "Custom Fields",
          type: "section",
          fields: incoming,
        },
      ],
    };
  }

  return {
    ...metadata,
    sections: [
      {
        ...first,
        fields: [...first.fields, ...incoming].sort((a, b) => a.displayOrder - b.displayOrder),
      },
      ...rest,
    ],
  };
};

export const getScreenMetadata = async (screenCode: string): Promise<ScreenMetadata> => {
  if (USE_MOCK) {
    await mockLatency();
    const metadata = mockCatalog[screenCode];
    if (!metadata) {
      throw new Error(`No metadata is registered for ${screenCode}.`);
    }
    return mergeCustomFields(metadata);
  }

  const response = await http.get(API_ENDPOINTS.metadata.screen(screenCode));
  return mergeCustomFields(unwrapData<ScreenMetadata>(response.data));
};
