import "../styles/globalStyles.scss";

import {
  ThemeProvider,
  TranslationProvider,
  TranslationsContext,
} from "@nexus/nexusExporter";
import React from "react";

import { useCombinedStore } from "../store/combined.store";
import { theme } from "../styles/theme";
import { Footer } from "./components/Footer";
import { SideBarNavigation } from "./components/SideBarNavigation";
import { Router } from "./Router";

export const App = (): React.JSX.Element => {
  const language = useCombinedStore((state) => state.language);

  const filesContexts = {
    ...import.meta.glob("../assets/translations/**/*.ts"),
    ...import.meta.glob("../../nexus/src/assets/translations/**/*.ts"),
  };

  return (
    <TranslationProvider
      TranslationsContext={TranslationsContext}
      filesContexts={filesContexts}
      language={language}
    >
      <ThemeProvider theme={theme}>
        <div className="bg-black flex flex-row text-white min-w-full max-w-full min-h-screen max-h-screen overflow-hidden">
          <SideBarNavigation />
          <div className="w-full flex flex-col h-screen">
            <main className="flex-1 overflow-y-auto">
              <div className="container mt-4 mb-4 mx-auto w-full">
                <Router />
              </div>
            </main>
            <div className="container mx-auto w-full">
              <Footer />
            </div>
          </div>
        </div>
      </ThemeProvider>
    </TranslationProvider>
  );
};
