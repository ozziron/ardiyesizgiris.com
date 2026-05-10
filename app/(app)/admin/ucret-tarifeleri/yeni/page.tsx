import { TariffRuleForm } from "@/components/admin/tariff-rule-form"

export default function NewTariffRulePage() {
  return <TariffRuleForm mode="create" submitMethod="POST" submitUrl="/api/admin/tariff-rules" />
}
