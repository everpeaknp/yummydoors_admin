export type ApiResponse<T> = {
  status: string;
  message: string;
  data: T;
};

export type RoleSummary = {
  code: string;
  name: string;
  restaurant_id: number | null;
  branch_id: number | null;
};

export type UserSummary = {
  id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
  status: string;
  is_verified: boolean;
  roles: RoleSummary[];
};

export type Category = {
  id: number;
  slug: string;
  name: string;
  icon_url: string | null;
  sort_order: number;
  is_featured: boolean;
  is_active?: boolean;
};

export type Restaurant = {
  id: number;
  name: string;
  slug: string;
  integration_mode: string;
  status: string;
  cover_image_url: string | null;
  logo_url: string | null;
  short_description: string | null;
  primary_cuisine_label: string | null;
  city: string | null;
  area: string | null;
  latitude: number | null;
  longitude: number | null;
  rating_average: number;
  review_count: number;
  supports_delivery: boolean;
  has_free_delivery: boolean;
  offer_text: string | null;
  delivery_eta_min_minutes: number | null;
  delivery_eta_max_minutes: number | null;
  sort_rank: number;
  is_featured: boolean;
  categories: Category[];
};

export type MenuItem = {
  id: number;
  restaurant_id: number;
  category_id: number | null;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  currency_code: string;
  is_available: boolean;
  food_type: "veg" | "non_veg" | "vegan" | null;
  is_spicy: boolean;
  is_featured: boolean;
  is_popular: boolean;
  popularity_score: number;
  rating_average: number;
  rating_count: number;
};

export type Promo = {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string;
  image_url_mobile: string | null;
  placement: "home_carousel" | "home_banner";
  target_type: "restaurant" | "category" | "menu_item" | "url" | "none";
  target_id: number | null;
  target_url: string | null;
  cta_text: string | null;
  sort_order: number;
  is_active: boolean;
  start_at: string | null;
  end_at: string | null;
};

export type RestaurantTableSummary = {
  id: number;
  code: string;
  label: string;
  zone: string | null;
  min_guest_count: number;
  max_guest_count: number;
  seat_capacity: number;
  category: string;
  status: string;
  sort_order: number;
};

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "seated"
  | "completed"
  | "cancelled"
  | "no_show";

export type ReservationStatusEvent = {
  status: ReservationStatus;
  note: string | null;
  created_at: string;
};

export type Reservation = {
  id: number;
  reservation_code: string;
  status: ReservationStatus;
  restaurant_id: number;
  restaurant_name: string;
  restaurant_slug: string;
  restaurant_logo_url: string | null;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  occasion: string | null;
  special_request: string | null;
  cancellation_reason: string | null;
  source: string;
  selected_table: RestaurantTableSummary | null;
  selected_table_label: string | null;
  selected_table_zone: string | null;
  created_at: string;
  updated_at: string;
  status_events: ReservationStatusEvent[];
};
