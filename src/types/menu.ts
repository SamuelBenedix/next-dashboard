export interface MenuItem {
  id: number
  type: number
  name: string
  route: string
  order: number
  visible: number
  parentNavigationId: number | null
  iconClass: string | null
}
