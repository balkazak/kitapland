export interface RoleLabels {
  [key: string]: string | { [key: string]: string }
}

export const roleLabels: RoleLabels = {
  global: {
    Администратор: 'Администраторы системы',
    Менеджер: 'Менеджеры системы',
    Издатель: 'Издатели',
    Министерство: 'Министерство'
  },
  Школа: {
    Библиотекари: 'Библиотекари школы',
    'Классный руководитель': 'Классный руководитель',
    Школьники: 'Школьники',
    'Сотрудники школы': 'Сотрудники школы'
  },
  Колледж: {
    Библиотекари: 'Библиотекари колледжа',
    'Классный руководитель': 'Куратор',
    Школьники: 'Студенты',
    'Сотрудники школы': 'Сотрудники колледжа'
  }
}

export function getRoleLabel(role: string, organizationType: string | null | undefined): string {
  if (roleLabels.global && (roleLabels.global as { [key: string]: string })[role]) {
    return (roleLabels.global as { [key: string]: string })[role]
  }

  if (organizationType && roleLabels[organizationType]) {
    const orgRoles = roleLabels[organizationType] as { [key: string]: string }
    if (orgRoles[role]) {
      return orgRoles[role]
    }
  }

  return role
}
