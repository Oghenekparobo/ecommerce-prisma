import Head from "next/head";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { getProducts } from "lib/data";
import prisma from "lib/prisma";
import Image from "next/image";

export default function Home({products}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") return "wait a lil bit, page is loading";

  
  if (session.user.isAdmin) {
    router.push("/admin");

  }

  return (
    <div>
      <Head>
        <title>Shop</title>
        <meta name="description" content="Shop" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="text-center mt-10">
        <a href="api/auth/signin" className=" font-extrabold text-2xl">
          Shop
        </a>

        <div className='mt-20 sm:mx-auto max-w-4xl mx-10'>
          {products.map((product) => (
            <div className='mb-4 grid sm:grid-cols-2' key={product.id}>
              <div>
                <Image alt="image" src={`/` + product.image + `.jpg`} width={'600'} height={'600'} />
              </div>
              <div className='sm:ml-10 mb-20 sm:mb-0'>
                <h2 className='text-3xl font-extrabold'>{product.title}</h2>
                <h3 className='text-2xl font-extrabold mb-4'>
                  ${product.price / 100}
                </h3>
                <p className='text-xl'>{product.description}</p>
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
