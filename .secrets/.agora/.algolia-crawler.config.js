new Crawler({
  appId: "M714N0NZ0A",
  apiKey: "45d985550da903fd531c32feefc96737",
  indexPrefix: "agora_",
  rateLimit: 8,
  renderJavaScript: true,
  ignoreCanonicalTo: true,
  discoveryPatterns: ["https://docs.agora.io/en/**"],
  exclusionPatterns: [
    "https://docs.agora.io/en/",
    "https://docs.agora.io/en/sdks",
    "https://docs.agora.io/en/api-reference",
    "https://docs.agora.io/en/sitemap.xml",
    "**/reference/glossary",
  ],
  sitemaps: [],
  startUrls: [
    "https://docs.agora.io/en/video-calling/overview/product-overview",
    "https://docs.agora.io/en/interactive-live-streaming/overview/product-overview",
    "https://docs.agora.io/en/agora-chat/overview/product-overview",
    "https://docs.agora.io/en/signaling/overview/product-overview",
    "https://docs.agora.io/en/interactive-whiteboard/overview/product-overview",
    "https://docs.agora.io/en/agora-analytics/overview/product-overview",
    "https://docs.agora.io/en/cloud-recording/overview/product-overview",
    "https://docs.agora.io/en/on-premise-recording/overview/product-overview",
    "https://docs.agora.io/en/server-gateway/overview/product-overview",
    "https://docs.agora.io/en/flexible-classroom/overview/product-overview",
    "https://docs.agora.io/en/media-push/overview/product-overview",
    "https://docs.agora.io/en/media-pull/overview/product-overview",
    "https://docs.agora.io/en/extensions-marketplace/overview/product-overview",
    "https://docs.agora.io/en/voice-calling/overview/product-overview",
    "https://docs.agora.io/en/help/quality-issues/ios_bluetooth",
    "https://docs.agora.io/en/help/quality-issues/video_blank",
    "https://docs.agora.io/en/help/integration-issues/system_volume",
    "https://docs.agora.io/en/help/integration-issues",
    "https://docs.agora.io/en/help/quality-issues",
    "https://docs.agora.io/en/help/general-product-inquiry",
    "https://docs.agora.io/en/help/account-and-billing",
    "https://docs.agora.io/en/help/other-issues",
    "https://api-ref.agora.io/en/dir.html",
  ],
  actions: [
    {
      indexName: "DocsSearch",
      pathsToMatch: ["https://docs.agora.io/en/**"],
      recordExtractor: (extractor) => {
        const searchWeight = {
          category: {
            docs: 10,
            help: 50,
            default: 999,
          },
          docsWeight: {
            develop: 10,
            reference: 20,
            "get-started": 30,
            overview: 40,
          },
          product: {
            "video-calling": 10,
            "interactive-live-streaming": 20,
            "agora-chat": 40,
            signaling: 50,
            "interactive-whiteboard": 60,
            "agora-analytics": 70,
            "cloud-recording": 80,
            "on-premise-recording": 90,
            "server-gateway": 100,
            "flexible-classroom": 110,
            "media-pull": 120,
            "media-push": 130,
            "voice-calling": 140,
            default: 999,
          },
          platform: {
            android: 10,
            ios: 20,
            web: 30,
            macos: 40,
            windows: 50,
            "windows-cpp": 60,
            "windows-csharp": 70,
            unity: 80,
            flutter: 90,
            "react-native": 100,
            electron: 110,
            linux: 120,
            "linux-cpp": 130,
            "linux-java": 140,
            "cocos-creator": 150,
            "cocos-2d-x": 160,
            default: 999,
          },
          version: {
            "3.x": 10,
            "4.x": 20,
            default: 999,
          },
        };

        const { $, helpers, url } = extractor;
        const lastItem = $(
          ".menu__link.menu__link--sublist.menu__link--active, .navbar__item.navbar__link--active, .header__navigation-menu li.active a",
        )
          .last()
          .text();

        const getTitleCase = (str = "") => {
          str = str.replace(/\-/g, " ");
          return str.replace(/(^\w|\s\w)(\S*)/g, (_, m1, m2) => m1.toUpperCase() + m2.toLowerCase());
        };

        let title = "",
          productKey = "",
          platformKey = "",
          versionKey = "",
          category = "docs";

        const spiltData = url.toString().split("https://docs.agora.io/en")[1].split("/");

        if (spiltData[1] === "sdks" || spiltData[1] === "help" || spiltData[1] === "api-reference") {
          category = spiltData[1];
          title = lastItem || "Docs";
          if (spiltData[1] === "help") category = "help";
        } else {
          productKey = spiltData[1] === "3.x" ? spiltData[2] : spiltData[1];
          let product = productKey + " ❯";

          // @ts-ignore
          platformKey = url.toString().includes("platform") ? url.toString().split("platform=")[1] : "";

          versionKey = spiltData[1] === "3.x" ? spiltData[1] : "4.x";
          let currentItem = lastItem ? "❯ " + lastItem : "";

          title = `Docs ❯ ${getTitleCase(product)} ${getTitleCase(versionKey)} ${getTitleCase(currentItem)}`;
        }

        // @ts-ignore
        const getWeight = (data) => {
          let weight = 90;
          for (let key in data) {
            if (url.toString().includes(key)) {
              // @ts-ignore
              weight = data[key];
            }
          }
          return weight;
        };

        // @ts-ignore
        const pageWeight = searchWeight.category[category || "default"];
        // @ts-ignore
        const productWeight = searchWeight.product[productKey || "default"];
        // @ts-ignore
        const platformWeight = searchWeight.platform[platformKey || "default"];
        // @ts-ignore
        const versionWeight = searchWeight.version[versionKey || "default"];
        const docsWeight = getWeight(searchWeight.docsWeight);

        const records = helpers.docsearch({
          recordProps: {
            lvl0: {
              selectors: "",
              defaultValue: title,
            },
            lvl1: ["header > h1"],
            lvl2: [".markdown h2"],

            content: [".markdown"],
            category: {
              selectors: "",
              defaultValue: category,
            },
            product: {
              selectors: "",
              defaultValue: productKey,
            },

            pageWeight: {
              selectors: "",
              defaultValue: pageWeight,
            },
            productWeight: {
              selectors: "",
              defaultValue: productWeight,
            },
            platformWeight: {
              selectors: "",
              defaultValue: platformWeight,
            },
            platform: {
              selectors: "",
              defaultValue: "",
            },
            versionWeight: {
              selectors: "",
              defaultValue: versionWeight,
            },
            // @ts-ignore
            version: {
              selectors: "",
              defaultValue: spiltData[1] === "3.x" ? spiltData[1] : "4.x",
            },
            // @ts-ignore
            docsWeight: {
              selectors: "",
              defaultValue: docsWeight,
            },
          },
          indexHeadings: true,
          aggregateContent: true,
          recordVersion: "v3",
        });
        return records.filter((item) => item.content);
      },
    },
    {
      indexName: "DocsSearch",
      pathsToMatch: ["https://api-ref.agora.io/en/**"],
      recordExtractor: (extractor) => {
        const { $, helpers, url } = extractor;

        const getTitleCase = (str = "") => {
          str = str.replace(/\-/g, " ");
          return str.replace(/(^\w|\s\w)(\S*)/g, (_, m1, m2) => m1.toUpperCase() + m2.toLowerCase());
        };

        const spiltData = url.toString().split("https://api-ref.agora.io/en")[1].split("/");
        let productKey = spiltData[1];
        let product = productKey ? productKey + " ❯" : "";
        let platformKey = spiltData[2];
        let platform = platformKey ? platformKey + " ❯" : "";
        let version = getTitleCase(spiltData[3]);
        const title = `API Reference ❯ ${getTitleCase(product)} ${getTitleCase(platform)} ${version}`;

        const lvl0 = title;
        const records = helpers.docsearch({
          recordProps: {
            lvl0: {
              selectors: "",
              defaultValue: lvl0,
            },
            lvl1: ["h1", ".title"],
            lvl2: ["td > a", ".tsd-anchor-link > a", ".identifier"],
            content: ["td", ".content", ".tsd-comment > p", "td > .ph"],
            //@ts-ignore
            pageWeight: {
              selectors: "",
              defaultValue: 30,
            },
            product: {
              selectors: "",
              defaultValue: productKey,
            },
            platform: {
              selectors: "",
              defaultValue: platformKey,
            },
            category: {
              selectors: "",
              defaultValue: "api-reference",
            },
            version: {
              selectors: "",
              defaultValue: version,
            },
          },
          indexHeadings: true,
          aggregateContent: true,
          recordVersion: "v3",
        });
        return records.filter((item) => item.content);
      },
    },
  ],
  initialIndexSettings: {
    DocsSearch: {
      attributesForFaceting: ["type", "lang", "language", "version", "docusaurus_tag"],
      attributesToRetrieve: ["hierarchy", "content", "anchor", "url", "url_without_anchor", "type"],
      attributesToHighlight: ["hierarchy", "content"],
      attributesToSnippet: ["content:10"],
      camelCaseAttributes: ["hierarchy", "content"],
      searchableAttributes: [
        "unordered(hierarchy.lvl0)",
        "unordered(hierarchy.lvl1)",
        "unordered(hierarchy.lvl2)",
        "unordered(hierarchy.lvl3)",
        "unordered(hierarchy.lvl4)",
        "content",
      ],
      distinct: true,
      attributeForDistinct: "content",
      customRanking: ["desc(weight.pageRank)", "desc(weight.level)", "asc(weight.position)"],
      ranking: ["words", "filters", "typo", "attribute", "proximity", "exact", "custom"],
      highlightPreTag: '<span class="algolia-docsearch-suggestion--highlight">',
      highlightPostTag: "</span>",
      minWordSizefor1Typo: 2,
      minWordSizefor2Typos: 3,
      allowTyposOnNumericTokens: false,
      minProximity: 1,
      ignorePlurals: true,
      advancedSyntax: true,
      attributeCriteriaComputedByMinProximity: true,
      removeWordsIfNoResults: "allOptional",
      separatorsToIndex: "_",
    },
  },
});
