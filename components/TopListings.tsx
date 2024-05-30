import Link from "next/link";
import ListingCard from "./ListingCard";

const imageUrl =
  "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?q=80&w=3388&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export default function TopListings() {
  return (
    <>
      <div className="sm:hidden">
        <h2 className="text-4xl font-bold">
          Discover pawsome places for you and your dog
        </h2>
        <div className="grid-cols-1 mb-5">
          <Link href="/listing/the-lil-brew">
            <ListingCard
              city="Christchurch"
              imageUrl={imageUrl}
              name="The Lil Brew"
              promoted
              region="Canterbury"
              tags={["friendly", "Good Vibes", "Gift Store"]}
              types={["Cafe", "Store"]}
            />
          </Link>
          <ListingCard
            city="Christchurch"
            imageUrl={imageUrl}
            name="The Lil Brew"
            promoted
            region="Canterbury"
            tags={["friendly", "Good Vibes", "Gift Store"]}
            types={["Cafe", "Store"]}
          />
          <ListingCard
            city="Christchurch"
            imageUrl={imageUrl}
            name="The Lil Brew"
            promoted
            region="Canterbury"
            tags={["friendly", "Good Vibes", "Gift Store"]}
            types={["Cafe", "Store"]}
          />
          <ListingCard
            city="Christchurch"
            imageUrl={imageUrl}
            name="The Lil Brew"
            promoted
            region="Canterbury"
            tags={["friendly", "Good Vibes", "Gift Store"]}
            types={["Cafe", "Store"]}
          />
        </div>
      </div>

      <div className="hidden sm:block">
        <h2 className="mb-8 text-4xl font-bold">
          Discover pawsome places for you and your dog
        </h2>
        <div className="py-10 w-full mx-auto">
          <div className="grid grid-cols-4 gap-10">
            {Array.from([1, 2, 3, 4, 5, 6, 7, 8]).map((item) => (
              <ListingCard
                key={item}
                city="Christchurch"
                imageUrl={imageUrl}
                name="The Lil Brew"
                promoted
                region="Canterbury"
                tags={["friendly", "Good Vibes", "Gift Store"]}
                types={["Cafe", "Store"]}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
