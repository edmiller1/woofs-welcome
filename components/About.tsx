import Image from "next/image";
import { Button } from "./ui/button";

const imageUrl =
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZG9nfGVufDB8fDB8fHww";

export default function About() {
  return (
    <>
      <section className="my-10 px-8 border-t sm:hidden">
        <div className="my-5 flex flex-col">
          <Image src={imageUrl} alt="image" width={500} height={500} />
          <div className="flex flex-col">
            <h2 className="my-2 font-semibold text-2xl">About</h2>
            <p className="my-1">
              We are a family run website, who&apos;s main mission is to help
              find all the dog-friendly places across New Zealand.
            </p>
            <p className="my-2">
              Finding a dog-friendly eatery or park can sometimes be hard, but
              we want to be able to make the search easy so you can plan trips
              with your fur-babies in mind.
            </p>
            <Button className="my-2 w-1/3">Learn More</Button>
          </div>
        </div>
      </section>

      <section className="hidden sm:block my-10 py-10 px-8 border-t">
        <div className="my-5 flex justify-between">
          <div className="flex flex-col w-2/5">
            <h2 className="mb-8 text-4xl font-bold">About</h2>
            <p className="my-1">
              We are a family run website, who&apos;s main mission is to help
              find all the dog-friendly places across New Zealand.
            </p>
            <p className="my-2">
              Finding a dog-friendly eatery or park can sometimes be hard, but
              we want to be able to make the search easy so you can plan trips
              with your fur-babies in mind.
            </p>
            <Button className="my-2 w-1/3">Learn More</Button>
          </div>
          <div className="w-2/5">
            <Image src={imageUrl} alt="image" width={500} height={500} />
          </div>
        </div>
      </section>
    </>
  );
}
