export type MenuLink = {
    id: number;
    label: string;
    url: string;
    description: string | null;
    opens_in_new_tab: boolean;
    children: MenuLink[];
};

export type SiteMenus = {
    header: MenuLink[];
    quick_links: MenuLink[];
    footer: MenuLink[];
};

export type SiteSettings = {
    office_name: string;
    office_address: string;
    email: string;
    phone: string | null;
    facebook_url: string | null;
    map_url: string | null;
    director_name: string;
    director_position: string;
    office_hours: string;
};

export type Site = {
    settings: SiteSettings;
    menus: SiteMenus;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type Paginated<T> = {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        links: PaginationLink[];
        path: string;
        per_page: number;
        to: number | null;
        total: number;
    };
};

export type PostTypeValue = 'announcement' | 'career' | 'award';

export type PostImage = {
    id: number;
    url: string;
    thumbnail_url: string;
    alt: string | null;
    width: number | null;
    height: number | null;
};

export type PostSummary = {
    id: number;
    type: PostTypeValue;
    type_label: string;
    title: string;
    slug: string;
    excerpt: string | null;
    position: string | null;
    published_at: string | null;
    closing_at: string | null;
    cover: PostImage | null;
};

export type PostDetail = PostSummary & {
    body: string | null;
    images: PostImage[];
    video_url: string | null;
    youtube_id: string | null;
};

export type IssuanceTypeOption = {
    id: number;
    name: string;
    slug: string;
};

export type IssuanceItem = {
    id: number;
    title: string;
    reference_no: string | null;
    issued_on: string;
    type: string;
    is_internal: boolean;
    file_url: string;
    file_extension: string;
};

export type DownloadItem = {
    id: number;
    title: string;
    description: string | null;
    file_url: string;
    file_size: number;
    file_extension: string;
};

export type DownloadCategoryGroup = {
    id: number;
    name: string;
    slug: string;
    downloads: DownloadItem[];
};

export type BannerSlide = {
    id: number;
    title: string;
    image_url: string;
    link_url: string | null;
    alt: string | null;
};
