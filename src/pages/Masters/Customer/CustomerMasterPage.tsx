import { GenericPage } from "@/components/metadata/GenericPage";
import { toastShown } from "@/redux/features/ui/uiSlice";
import { useAppDispatch } from "@/redux/hooks";

export const CustomerMasterPage = () => {
  const dispatch = useAppDispatch();

  return (
    <GenericPage
      screenCode="customer-master"
      onAction={async (action) => {
        dispatch(
          toastShown({
            message: `${action.label} would call ${action.endpoint ?? "the metadata endpoint"}.`,
            severity: "info",
          }),
        );
      }}
    />
  );
};
