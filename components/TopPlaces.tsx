import Image from "next/image";
import LocationCard from "./LocationCard";

const imageUrl =
  "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?q=80&w=3388&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export default function TopPlaces() {
  return (
    <>
      <div className="my-24 w-full sm:hidden">
        <h2 className="mb-8 text-4xl font-bold -ml-5">
          Explore plenty of locations
        </h2>
        <div className="grid grid-cols-1 gap-y-12">
          <TopPlacesCard imageUrl={imageUrl} title="Auckland" />
          <TopPlacesCard imageUrl={imageUrl} title="Hamilton" />
          <TopPlacesCard imageUrl={imageUrl} title="Dunedin" />
          <TopPlacesCard imageUrl={imageUrl} title="Wellington" />
          <TopPlacesCard imageUrl={imageUrl} title="Southland" />
          <TopPlacesCard imageUrl={imageUrl} title="Hawke's bay" />
          <TopPlacesCard imageUrl={imageUrl} title="Christchurch" />
        </div>
      </div>

      <div className="hidden sm:block my-24 w-full">
        <h2 className="mb-8 text-4xl font-bold">Explore plenty of locations</h2>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4 cursor-pointer">
            <LocationCard imageUrl={imageUrl}>
              <p className="font-bold text-2xl">Auckland</p>
            </LocationCard>
          </div>
          <div className="col-span-4 cursor-pointer">
            <LocationCard imageUrl={imageUrl}>
              <p className="font-bold text-2xl">Hamilton</p>
            </LocationCard>
          </div>
          <div className="col-span-4 cursor-pointer">
            <LocationCard imageUrl={imageUrl}>
              <p className="font-bold text-2xl">Dunedin</p>
            </LocationCard>
          </div>

          <div className="col-span-8 cursor-pointer">
            <LocationCard imageUrl={imageUrl}>
              <p className="font-bold text-2xl">Wellington</p>
            </LocationCard>
          </div>
          <div className="col-span-4 cursor-pointer">
            <LocationCard imageUrl={imageUrl}>
              <p className="font-bold text-2xl">Southland</p>
            </LocationCard>
          </div>

          <div className="col-span-4 cursor-pointer">
            <LocationCard imageUrl={imageUrl}>
              <p className="font-bold text-2xl">Hawke&apos;s Bay</p>
            </LocationCard>
          </div>
          <div className="col-span-8 cursor-pointer">
            <LocationCard imageUrl={imageUrl}>
              <p className="font-bold text-2xl">Christchurch</p>
            </LocationCard>
          </div>
        </div>
      </div>
    </>
  );
}

interface TopPlacesProps {
  imageUrl: string;
  title: string;
}

function TopPlacesCard({ imageUrl, title }: TopPlacesProps) {
  return (
    <div className="relative h-60">
      <Image
        alt="image"
        src={imageUrl}
        width={1000}
        height={500}
        className="h-full w-full object-cover rounded-lg object-center scale-[1.15] brightness-75"
      />
      <p className="absolute bottom-1 text-white font-bold text-2xl">{title}</p>
    </div>
  );
}
