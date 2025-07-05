export type HomeFeed =  {
  success?: boolean,
  data?: HomeFeedData[];
}
export enum FEED_TYPE {
  MOBILE = 0,
  TV,
  WEB,
}

export enum WIDGET_TYPE {
  NOTHING = 0,
  HERO,
  COURSES,
  FEATURED_COURSE,
  COURSE_DETAILS,
  CONTINUE_WATCHING,
  TOP_BANNER
}


export type HomeFeedData = {
  id?:number | null,
  type: WIDGET_TYPE,
  title: string|null,
  hero: Hero | null,
  items: Item[] | null,
  featured: Item | null,
  categories: Item[] | null,
  visible?:boolean,
  order?:number
}

export type Item = {
  id:number,
  image:string,
  title:string,
  publish_date?:string,
  feed_detail_id?:number,
  order?:number
}
export type Hero =  {
  id?: number,
  image_url?: string,
  title?: string,
  video?: string,
  description?: string,
}
