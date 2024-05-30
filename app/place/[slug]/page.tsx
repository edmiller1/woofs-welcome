import { Query } from "appwrite";
import { databases } from "../../../lib/appwrite";
import { type Place } from "../../../lib/types";
import { Button } from "@/components/ui/button";
import Head from "next/head";
import Image from "next/image";
import Error from "./error";
import CoverImage from "./components/CoverImage";
import PlainActivityCard from "./components/PlainActivityCard";
import NotFound from "@/components/NotFound";

const imageUrl =
  "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?q=80&w=3388&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export const getPlace = async (slug: string) => {
  const { documents } = await databases.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_PLACES_ID!,
    [Query.equal("slug", String(slug))]
  );

  return documents[0] as Place;
};

export default async function PlacePage({
  params,
}: {
  params: { slug: string };
}) {
  const place = await getPlace(params.slug);

  console.log(place);

  if (!place) {
    return <NotFound />;
  }

  return (
    <>
      <Head>
        <title>Listings in {place.name}</title>
      </Head>
      <div className="w-full sm:hidden">
        <div className="relative">
          <Image
            src={place.mainImage}
            alt="cover image"
            width={1000}
            height={500}
            className="brightness-50"
          />
          <div className="absolute top-5 left-10">
            <div className="grid grid-cols-3 gap-4">
              <Button variant="outline" className="bg-transparent text-white">
                Eat & Drink
              </Button>
              <Button variant="outline" className="bg-transparent text-white">
                Stay
              </Button>
              <Button variant="outline" className="bg-transparent text-white">
                Explore
              </Button>
              <Button variant="outline" className="bg-transparent text-white">
                Adventure
              </Button>
            </div>
          </div>
          <div className="absolute bottom-24 left-5 text-white">
            <h1 className="text-4xl font-extrabold capitalize">{place.name}</h1>
          </div>
        </div>
        <div className="ml-5 mr-10 mt-5 text-sm">
          <p className="my-3">{place.description}</p>
        </div>
        <div className="mx-5 my-8">
          <h2 className="text-2xl font-semibold">Top Places in {place.name}</h2>
          <div className="my-5 grid grid-cols-1 gap-4">
            {Array.from([1, 2, 3, 4, 5, 6, 7, 8]).map((item) => (
              <PlainActivityCard
                key={item}
                city="Christchurch"
                imageUrl={imageUrl}
                name="The Lil Brew"
                promoted
                region="Canterbury"
                tags={["fun", "Happy"]}
                types={["Cafe", "Store"]}
              />
            ))}
          </div>
        </div>
        <div className="mx-5 my-8">
          <h2 className="text-2xl font-semibold">
            More places in {place.region}
          </h2>
          <div className="no-scrollbar my-5 flex items-center space-x-10 overflow-x-auto">
            {Array.from([1, 2, 3, 4, 5, 6, 7, 8]).map((item) => (
              <div className="w-1/2" key={item}>
                <PlainActivityCard
                  key={item}
                  city="Christchurch"
                  imageUrl={imageUrl}
                  name="The Lil Brew"
                  promoted
                  region="Canterbury"
                  tags={["fun", "Happy"]}
                  types={["Cafe", "Store"]}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden sm:block w-full">
        <div className="relative">
          <CoverImage title={place.name} url={place.mainImage} />
          <div className="absolute top-10 left-5 sm:left-12 md:left-40 lg:left-1/4 xl:left-1/3">
            <div className="flex items-center p-4 space-x-10 justify-center">
              <Button variant="outline" className="bg-transparent text-white">
                Eat & Drink
              </Button>
              <Button variant="outline" className="bg-transparent text-white">
                Stay
              </Button>
              <Button variant="outline" className="bg-transparent text-white">
                Explore
              </Button>
              <Button variant="outline" className="bg-transparent text-white">
                Adventure
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute sm:bottom-[32rem] md:bottom-80 xl:bottom-32 left-10 text-white">
          <h1 className="text-6xl font-extrabold capitalize">{place.name}</h1>
          <div className="mt-10 w-3/5 text-lg sm:hidden md:block">
            <p className="my-3">{place.description}</p>
          </div>
        </div>

        <div className="container mx-auto px-5 mt-5">
          <div className="sm:block mt-10 w-full text-lg md:hidden">
            <p className="my-3">fdfsdf</p>
          </div>
          <div className="my-10">
            <div className="my-24">
              <h2 className="text-4xl font-semibold">
                Top Places in {place.name}
              </h2>
              <div className="my-10 grid grid-cols-4 gap-x-4 gap-y-10">
                {Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).map(
                  (item) => (
                    <PlainActivityCard
                      key={item}
                      city="dasd"
                      imageUrl={imageUrl}
                      name="The Lil Brew"
                      promoted
                      region="dsdasd"
                      tags={["fun", "Happy"]}
                      types={["Cafe", "Store"]}
                    />
                  )
                )}
              </div>
            </div>
            <div className="my-24">
              <h2 className="text-4xl font-semibold">
                More places in {place.region}
              </h2>
              <div className="my-10 grid grid-cols-4 gap-x-4 gap-y-10">
                {Array.from([1, 2, 3, 4, 5, 6, 7, 8]).map((item) => (
                  <PlainActivityCard
                    key={item}
                    city="sdadas"
                    imageUrl={imageUrl}
                    name="The Lil Brew"
                    promoted
                    region="gfgdf"
                    tags={["fun", "Happy"]}
                    types={["Cafe", "Store"]}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
