import TopListings from "./TopListings";
import TopPlaces from "./TopPlaces";

export default function Hero() {
  return (
    <>
      {/* Mobile */}
      <section className="mx-8 flex-col flex items-center sm:hidden">
        <h1 className="mt-12 text-6xl text-center font-bold tracking-tighter leading-tight">
          Explore NZ&apos;s Dog Friendly Places.
        </h1>
        <h2 className="text-center text-lg mt-5">
          Whether you are staying for a week, looking for a place to eat or
          wanting to experience what New Zealand has to offer. We&apos;ve got
          your back, when it comes to visting dog-friendly locations.
        </h2>
        <TopPlaces />
        <TopListings />
      </section>

      {/* Desktop */}
      <section className="hidden sm:flex flex-col items-center justify-center">
        <div className="mt-10 md:w-full lg:w-4/5 xl:w-3/5">
          <h1 className="text-8xl font-bold tracking-tighter leading-tight  ">
            Explore NZ&apos;s Dog Friendly Places.
          </h1>
          <h2 className="text-left text-lg mt-5">
            Whether you are staying for a week, looking for a place to eat or
            wanting to experience what New Zealand has to offer. We&apos;ve got
            your back, when it comes to visting dog-friendly locations.
          </h2>
        </div>
        <TopPlaces />
        <div className="py-10 w-full mx-auto">
          <TopListings />
        </div>
      </section>
    </>
  );
}
