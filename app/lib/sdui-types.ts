export type SDUIComponentType = 
  | 'StatsGroup' 
  | 'DataTable' 
  | 'DetailCard' 
  | 'Banner' 
  | 'TabGroup' 
  | 'FormModal';

export type SDUIFieldType = 
  | 'text' 
  | 'currency' 
  | 'date' 
  | 'badge' 
  | 'tag' 
  | 'email' 
  | 'phone' 
  | 'percent'
  | 'link'
  | 'avatar';

export interface SDUIColumn {
  key: string;
  label: string;
  type: SDUIFieldType;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  badgeVariants?: Record<string, { label: string; color: 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'gray' }>;
  prefix?: string;
  suffix?: string;
}

export interface SDUIStatItem {
  id: string;
  label: string;
  value: string | number;
  type?: SDUIFieldType;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: string;
  description?: string;
  suffix?: string;
}

export interface SDUIDetailField {
  key: string;
  label: string;
  type: SDUIFieldType;
  badgeVariants?: Record<string, { label: string; color: string }>;
  prefix?: string;
  suffix?: string;
  gridSpan?: number; // 1 to 3
}

export interface SDUIComponent {
  id: string;
  type: SDUIComponentType;
  title?: string;
  subtitle?: string;
  items?: SDUIStatItem[];
  columns?: SDUIColumn[];
  fields?: SDUIDetailField[];
  rowActionUrl?: string; // e.g. "/customers/{id}"
  emptyText?: string;
}

export interface SDUIPageSchema {
  pageKey: string;
  version: string;
  lastUpdated: string;
  title: string;
  subtitle?: string;
  components: SDUIComponent[];
  data?: Record<string, any>;
}

export interface DynamicFieldDef {
  key: string;
  label: string;
  type: SDUIFieldType;
  entity: 'customer' | 'order';
  showInList?: boolean;
  showInDetail?: boolean;
  order?: number;
}
