import { useTheme } from "@theme";
import React from "react";
import { Text } from "react-native";
import { GenericAdminScreen } from "../components/GenericAdminScreen";
import { StatusBadge } from "../components/StatusBadge";
import { useAdminCrud } from "../hooks/useAdminCrud";
import { ColumnDef } from "../types/admin.types";
import { Grupo } from "./grupo.types";
import { GrupoForm } from "./GrupoForm";
import { grupoService } from "./grupoService";

export function GrupoScreen() {
  const { theme } = useTheme();

  const columns: ColumnDef[] = [
    { key: "nombre", header: "Nombre", flex: 1 },
    { key: "codigo", header: "Código", width: 100 },
    { key: "paralelo", header: "Paralelo", width: 80 },
    { key: "turno", header: "Turno", width: 90 },
    {
      key: "gestionNombre",
      header: "Gestión",
      width: 100,
      render: (val, item) => (
        <Text style={{ fontSize: 13, fontWeight: "500", color: theme.colors.text }}>
          {val || `ID ${item.idGestion}`}
        </Text>
      ),
    },
    { key: "cupos", header: "Cupos", width: 70 },
    {
      key: "horarios",
      header: "Horarios",
      width: 80,
      render: (val: any[]) => (
        <Text style={{ fontSize: 12, color: theme.colors.text }}>
          {val?.length ?? 0} día(s)
        </Text>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      width: 110,
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  const crud = useAdminCrud<Grupo>({
    fetchAll: grupoService.getAll,
    create: grupoService.create,
    update: (id, data) => grupoService.update(Number(id), data),
    delete: grupoService.delete,
    searchFields: ["nombre", "codigo", "gestionNombre"],
    idField: "idGrupo",
  });

  const handleSaveWrapper = async (formData: Partial<Grupo>) => {
    if (crud.selectedItem?.idGrupo) {
      await crud.handleSave({
        ...formData,
        idGrupo: crud.selectedItem.idGrupo,
      });
    } else {
      await crud.handleSave(formData);
    }
  };

  return (
    <GenericAdminScreen
      title="Grupos"
      columns={columns}
      data={crud.filteredData}
      loading={crud.loading}
      onSearch={crud.setSearchText}
      onAdd={crud.openCreate}
      onEdit={crud.openEdit}
      onDelete={crud.handleDelete}
      modalVisible={crud.modalVisible}
      onCloseModal={crud.closeModal}
      selectedItem={crud.selectedItem}
      searchPlaceholder="Buscar grupo..."
      renderForm={() => (
        <GrupoForm
          initialData={crud.selectedItem}
          onSave={handleSaveWrapper}
          onCancel={crud.closeModal}
        />
      )}
      itemToDelete={crud.itemToDelete}
      onConfirmDelete={crud.confirmDelete}
      onCancelDelete={crud.cancelDelete}
    />
  );
}