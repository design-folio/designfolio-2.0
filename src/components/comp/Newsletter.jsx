import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Newsletter = () => {
  return (
    <section className="py-16">
      <h2 className="text-2xl font-bold mb-8">Newsletter</h2>
      <p className="dark:text-gray-400 text-gray-600 mb-6">
        I share clean dev tips once a month & I would love to share them with
        you. Give me a try - No spam, I promise.
      </p>
      <div className="flex gap-4">
        <Input
          type="email"
          placeholder="your@email.com"
          className="bg-card border-none"
        />
        <Button>Subscribe</Button>
      </div>
    </section>
  );
};
