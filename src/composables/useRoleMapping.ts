import { computed } from 'vue'
import { useAuth } from '@/auth'
import { getRoleLabel } from '@/utils/roleMapping'

export function useRoleMapping() {
  const auth = useAuth()

  const organizationType = computed(() => auth.userData.value?.school?.organization?.label || null)

  const mapRole = (role: string) => {
    return getRoleLabel(role, organizationType.value)
  }

  return {
    mapRole
  }
}
