"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search as SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Search() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchViaKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm) {
      router.push(`/explore?query=${searchTerm}`);
    }
  };

  const handleSearch = () => {
    router.push(`/explore?query=${searchTerm}`);
  };

  return (
    <>
      <Input
        type="text"
        placeholder="Search Places..."
        className="w-[18rem]"
        value={searchTerm}
        onChange={handleChange}
        onKeyDown={(e) => handleSearchViaKey(e)}
      />
      <div className="hidden sm:block">
        <Button size="icon" className="ml-2" onClick={handleSearch}>
          <SearchIcon size={20} />
        </Button>
      </div>
    </>
  );
}
