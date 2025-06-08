import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/server";
import { Hero } from "./components/hero";
import { Features } from "./components/features";
import { Footer } from "@/components/footer";
import { Pricing } from "./components/pricing";

const BusinessPage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <Navbar user={user} />
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
};

export default BusinessPage;
