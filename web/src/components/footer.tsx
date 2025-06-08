import { Button } from "./ui/button";

export const Footer = () => {
  return (
    <div className="w-full h-52 flex flex-col gap-10 justify-center items-center border-t">
      <div className="flex items-center text-center text-lg">
        <Button variant="link" className="text-foreground">
          About
        </Button>
        <Button variant="link" className="text-foreground">
          Mobile App
        </Button>
        <Button variant="link" className="text-foreground">
          Blog
        </Button>
        <Button variant="link" className="text-foreground">
          Contact
        </Button>
      </div>
      <div className="text-muted-foreground text-sm">
        &copy; {new Date().getFullYear()} Woofs Welcome. All rights reserved.
      </div>
    </div>
  );
};
