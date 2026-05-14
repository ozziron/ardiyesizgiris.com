import { FreeTimeRuleBulkForm } from "@/components/admin/free-time-rule-bulk-form"

/**
 * "Yeni Muafiyet Kuralı" sayfası — artık tek-tek kural girişi yerine
 * toplu girişi destekleyen forma yönlendirir. Mevcut tekli FreeTimeRuleForm
 * sadece düzenleme (edit) akışında kullanılmaya devam eder; tek bir kuralı
 * güncellerken çoklu seçim mantıksız.
 */
export default function NewFreeTimeRulePage() {
  return <FreeTimeRuleBulkForm />
}
