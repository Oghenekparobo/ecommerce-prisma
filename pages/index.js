import Head from "next/head";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { getProducts } from "lib/data";
import prisma from "lib/prisma";
import Image from "next/image";
import { useState } from "react";
import { useEffect } from "react";
import * as localForage from "localforage";
import Script from "next/script";

export default function Home({ products }) {
  const [cart, setCart] = useState([]);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    localForage.getItem("cart", function (err, value) {
      if (value) {
        setCart(value);
      }
    });
  }, []);

  useEffect(() => {
    localForage.setItem("cart", cart);
  }, [cart]);

  if (status === "loading") return "wait a lil bit, page is loading";

  if (session.user.isAdmin) {
    router.push("/admin");
  }

  return (
    <div>
      <Script src="https://js.stripe.com/v3/" />
      <Head>
        <title>Shop</title>
        <meta name="description" content="Shop" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="text-center mt-10">
        <h1>
          {" "}
          <a href="api/auth/signin" className=" font-extrabold text-2xl">
            Shop
          </a>
        </h1>

        {cart.length > 0 && (
          <div className="mt-20 sm:mx-auto max-w-4xl mx-10 border-2 border-red-400">
            <h3 className="py-2 font-extrabold text-2xl text-center">
              Your cart
            </h3>
            {cart.map((item, index) => (
              <div
                key={index}
                className="px-4 py-2 border-y border-fuchsia-400 flex"
              >
                <div className="block mt-2">
                  <Image
                    alt="image"
                    src={`/` + item.product.image + ".jpg"}
                    width={"50"}
                    height={"50"}
                    className=""
                  />
                </div>
                <div className="mt-5 pl-4">
                  <span className="font-bold">{item.product.title}</span> -
                  quantity: {item.quantity}
                </div>

                <button
                  className="mx-auto bg-black text-white px-3 py-1 my-4 text-xl font-bold justify-center flex focus:bg-slate-500 hover:bg-slate-500"
                  onClick={async () => {
                    const res = await fetch("api/stripe/session", {
                      body: JSON.stringify({
                        cart,
                      }),
                      headers: {
                        "Content-Type": "application/json",
                      },
                      method: "POST",
                    });

                    const data = await res.json();

                    if (data.status === "error") {
                      alert(data.message);
                      return;
                    }

                    const sessionId = data.sessionId;
                    const stripePublicKey = data.stripePublicKey;

                    const stripe = Stripe(stripePublicKey);
                    const { error } = await stripe.redirectToCheckout({
                      sessionId,
                    });

                    setCart([]);
                  }}
                >
                  Go to checkout
                </button>

                <button
                  className="mx-auto bg-black text-white px-3 py-1 my-4 text-sm justify-center flex"
                  onClick={() => setCart([])}
                >
                  Clear cart
                </button>
              </div>
            ))}{" "}
          </div>
        )}

        <div className="mt-20 sm:mx-auto max-w-4xl mx-10">
          {products.map((product) => (
            <div className="mb-4 grid sm:grid-cols-2" key={product.id}>
              <div>
                <Image
                  alt="image"
                  src={`/` + product.image + `.jpg`}
                  width={"600"}
                  height={"600"}
                />
              </div>
              <div className="sm:ml-10 mb-20 sm:mb-0">
                <h2 className="text-3xl font-extrabold">{product.title}</h2>
                <h3 className="text-2xl font-extrabold mb-4">
                  ${product.price / 100}
                </h3>
                <button
                  className="mb-4 mx-auto bg-black text-white px-3 py-1 text-lg  hover:bg-slate-900 hover:font-bold rounded shadow"
                  onClick={() => {
                    const itemsAlreadyInCart = cart.filter((item) => {
                      return item.product.id === product.id;
                    });

                    if (itemsAlreadyInCart.length > 0) {
                      setCart([
                        ...cart.filter((item) => {
                          return item.product.id !== product.id;
                        }),
                        {
                          product: itemsAlreadyInCart[0].product,
                          quantity: itemsAlreadyInCart[0].quantity + 1,
                        },
                      ]);
                    } else {
                      setCart([...cart, { product, quantity: 1 }]);
                    }
                  }}
                >
                  Add to cart
                </button>
                <p className="text-xl">{product.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  let products = await getProducts(prisma);
  products = JSON.parse(JSON.stringify(products));
  return {
    props: {
      products,
    },
  };
}
