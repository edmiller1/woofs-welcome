import { Coffee, ShoppingBag } from "lucide-react";
import { ReactNode } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface Props {
  promoted: boolean;
  imageUrl: string;
  name: string;
  types: string[];
  city: string;
  region: string;
  tags: string[];
}

function getIcons(types: string[]): ReactNode {
  const icons: ReactNode[] = [];
  if (types.includes("Store")) {
    icons.push(<ShoppingBag size={16} />);
  }
  if (types.includes("Cafe")) {
    icons.push(<Coffee size={16} />);
  }

  return icons;
}

export default function PlainActivityCard({
  city,
  imageUrl,
  name,
  promoted,
  region,
  tags,
  types,
}: Props) {
  return (
    <div className="cursor-pointer">
      <div className="relative hover:brightness-90 transition duration-500">
        <div className="absolute top-4 left-4">
          {promoted ? <Badge>Top Pick</Badge> : null}
        </div>
        <div className="rounded-full">
          <Image
            src={imageUrl}
            alt="image"
            width={1000}
            height={500}
            className="rounded-lg"
          />
        </div>
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="font-semibold">{name}</span>
        <div className="flex space-x-2">{getIcons(types)}</div>
      </div>
      <span className="mt-1">
        {city}, {region}
      </span>
      <div className="mt-2 flex items-center space-x-2">
        {tags.length > 0
          ? tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))
          : null}
      </div>
    </div>
  );
}
