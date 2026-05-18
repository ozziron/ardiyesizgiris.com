import { CarrierSurchargeForm } from "@/components/admin/carrier-surcharge-form"

export default function NewCarrierSurchargePage() {
  return (
    <CarrierSurchargeForm
      mode="create"
      submitMethod="POST"
      submitUrl="/api/admin/carrier-surcharges"
    />
  )
}
