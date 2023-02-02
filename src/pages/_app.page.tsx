import "../lib/dayjs";
import { queryClient } from "@/lib/react-query";
import { globalStyles } from "@/styles/global";
import { QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";

globalStyles();

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {

  return(

    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <DefaultSeo 
          openGraph={{ 
            type: "website", 
            locale: "pt_BR", 
            url: "https://ignitecall.com.br/", 
            siteName: "IgniteCall", 
          }} 
        />
        <Component {...pageProps}/>
      </SessionProvider>
    </QueryClientProvider>

  );

}
