// screens/gestiones/GestionesScreen.tsx
import { useTheme } from "@/theme/useTheme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { CloseGestionModal } from "./components/CloseGestionModal";
import { CreateGestionModal } from "./components/CreateGestionModal";
import { DeactivateGestionModal } from "./components/DeactivateGestionModal";
import { DeleteGestionModal } from "./components/DeleteGestionModal";
import { DetailGestionModal } from "./components/DetailGestionModal";
import { EditGestionModal } from "./components/EditGestionModal";
import { FiltersBar } from "./components/FiltersBar";
import { GestionesHeader } from "./components/GestionesHeader";
import { GestionesTable } from "./components/GestionesTable";
import { PaginationFooter } from "./components/PaginationFooter";
import { useGestiones } from "./hooks/useGestiones";

export function GestionesScreen() {
  const { theme } = useTheme();
  const hook = useGestiones();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <GestionesHeader onNew={() => hook.setCreateVisible(true)} />
      <FiltersBar
        selectedPeriod={hook.filters.periodo}
        selectedYear={hook.filters.anio}
        selectedStatus={hook.filters.estado}
        onPeriodChange={(p) => hook.updateFilters({ periodo: p })}
        onYearChange={(y) => hook.updateFilters({ anio: y })}
        onStatusChange={(s) => hook.updateFilters({ estado: s })}
      />
      <GestionesTable
        gestiones={hook.gestiones}
        loading={hook.loading}
        onDetail={hook.setDetailGestion}
        onEdit={hook.setEditGestion}
        onClose={hook.setCloseGestion}
        onDelete={hook.setDeleteGestion}
        onDeactivate={hook.setDeactivateGestion}
      />
      <PaginationFooter meta={hook.meta} onPageChange={hook.setPage} />

      <CreateGestionModal
        visible={hook.createVisible}
        onClose={() => hook.setCreateVisible(false)}
        onSubmit={hook.handleCreate}
      />
      <EditGestionModal
        gestion={hook.editGestion}
        onClose={() => hook.setEditGestion(null)}
        onSubmit={(data) => hook.handleUpdate(hook.editGestion!.id, data)}
      />
      <CloseGestionModal
        gestion={hook.closeGestion}
        onClose={() => hook.setCloseGestion(null)}
        onConfirm={async () => {
          if (hook.closeGestion) {
            await hook.handleClose(hook.closeGestion.id);
          }
        }}
      />
      <DeleteGestionModal
        gestion={hook.deleteGestion}
        onClose={() => hook.setDeleteGestion(null)}
        onConfirm={() => hook.handleDelete(hook.deleteGestion!.id)}
      />
      <DetailGestionModal
        gestion={hook.detailGestion}
        onClose={() => hook.setDetailGestion(null)}
      />
      <DeactivateGestionModal
        gestion={hook.deactivateGestion}
        onClose={() => hook.setDeactivateGestion(null)}
        onConfirm={async () => {
          if (hook.deactivateGestion) {
            await hook.handleDeactivate(hook.deactivateGestion.id);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
