import './styles.css'

interface DescriptionLinksProps {
  linksCount: number
  categoriesCount: number
}

export default function DescriptionLinks({ linksCount, categoriesCount }: DescriptionLinksProps) {
  return (
    <div className="description-links">
      {linksCount} links e {categoriesCount} categorias
    </div>
  )
}
