import { Badge } from "./ui/badge";
import { ReactNode } from "react";
import { Coffee, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { DirectionAwareHover } from "./DirectionAwareHover";

interface Props {
  imageUrl: string;
  promoted: boolean;
  types: string[];
  name: string;
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

export default function ListingCard({
  city,
  imageUrl,
  name,
  promoted,
  region,
  tags,
  types,
}: Props) {
  return (
    <>
      <div className="flex flex-col my-10 sm:hidden">
        <div className="relative">
          <div className="absolute top-4 left-4">
            {promoted ? <Badge>Top Pick</Badge> : null}
          </div>
          <Image src={imageUrl} alt="image" width={350} height={100} />
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
            ? tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))
            : null}
        </div>
      </div>

      <DirectionAwareHover
        promoted={promoted}
        imageUrl={imageUrl}
        className="hidden sm:block cursor-pointer"
      >
        <div className="flex items-center justify-between mt-1 w-full">
          <span className="font-semibold">{name}</span>
          <div className="flex space-x-2">{getIcons(types)}</div>
        </div>
        <p className="font-normal text-sm">
          {city}, {region}
        </p>
        <div className="mt-2 flex items-center space-x-2">
          {tags.length > 0
            ? tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))
            : null}
        </div>
      </DirectionAwareHover>
    </>
  );
}
