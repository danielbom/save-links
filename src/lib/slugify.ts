export default function slugify(text: string) {
  let slug = text.toLowerCase()
  slug = slug.replace(/[áàâãå]/g, 'a')
  slug = slug.replace(/[éèẽê]/g, 'e')
  slug = slug.replace(/[ìíĩî]/g, 'i')
  slug = slug.replace(/[óòõô]/g, 'o')
  slug = slug.replace(/[úùũû]/g, 'u')
  slug = slug.replace(/[ç]/g, 'c')
  slug = slug.replace(/[ñ]/g, 'n')
  slug = slug.replace(/[ýÿ]/g, 'y')
  slug = slug.replace(/[ ]/g, '-')
  return '#' + slug
}
