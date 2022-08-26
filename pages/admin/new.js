import { useSession } from "next-auth/react";
import { Router, useRouter } from "next/router";
import { useState } from "react";

export default function NewProduct() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const router = useRouter();

  const { data: session, status } = useSession();

  const loading = status === "loading";

  if (status === "loading") return "wait a lil bit, page is loading";


  if (!session) {
    router.push("/");
    return;
  }

  if (!session.user.isAdmin) {
    router.push("/");
    return;
  }

  return (
    <div className="text-center">
      <h1 className="mt-10 font-extrabold text-2xl mb-8">Add new product</h1>

      <form
        className="mt-10"
        onSubmit={async (e) => {
          e.preventDefault();
          await fetch('/api/product', {
            body: JSON.stringify({
              title,
              price,
              description,
              image,
            }),
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
          });

          router.push('/admin');
        }}
      >
        <div className="flex-1 mb-5">
          <div className="flex-1 mb-2">Product title (required)</div>
          <input
            className="border p-1 text-white mb-4"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="flex-1 mb-2">Description</div>
          <textarea
            className="border p-1 text-white "
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex-1 mb-2">Product price in $ (required)</div>
          <input
            pattern="^\d*(\.\d{0,2})?$"
            className="border p-1 text-white mb-4"
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <div className="flex-1 mb-2">Product image</div>
          <input
            className="border p-1 text-white mb-4 "
            onChange={(e) => setImage(e.target.value)}
          />
        </div>

        <button
          className={`border px-8 py-2 mt-10 font-bold  ${
            title && price
              ? "bg-black text-white"
              : "cursor-not-allowed text-gray-500 border-gray-500"
          }`}
        >
          Add product
        </button>
      </form>
    </div>
  );
}
