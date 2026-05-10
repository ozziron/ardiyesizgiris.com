import { FreeTimeRuleForm } from "@/components/admin/free-time-rule-form"

export default function NewFreeTimeRulePage() {
  return <FreeTimeRuleForm mode="create" submitMethod="POST" submitUrl="/api/admin/free-time-rules" />
}
