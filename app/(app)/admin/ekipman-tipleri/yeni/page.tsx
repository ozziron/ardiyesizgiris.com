import { ContainerTypeForm } from "@/components/admin/container-type-form"

export default function NewContainerTypePage() {
  return (
    <ContainerTypeForm
      mode="create"
      submitMethod="POST"
      submitUrl="/api/admin/container-types"
    />
  )
}
