var WidgetMetadata = {
  id: "ti.bemarkt.vod.maccms",
  title: "VOD",
  description: "获取 VOD 影视数据",
  author: "Ti",
  site: "https://github.com/bemarkt/scripts/tree/master/provider/Forward",
  version: "1.1.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      title: "获取视频列表",
      description: "根据API地址、分类、页码等参数获取视频列表。",
      requiresWebView: false,
      functionName: "getVodList",
      params: [
        {
          name: "apiUrl",
          title: "视频源地址",
          type: "input",
          description:
            "当前仅支持苹果CMS的JSON API地址 (例如: https://example.com/api.php/provide/vod/)",
          value: "https://api.wwzy.tv/api.php/provide/vod/",
          placeholders: [
            {
              title: "极速资源",
              value: "https://jszyapi.com/api.php/provide/vod/",
            },
            {
              title: "木耳资源",
              value: "https://json02.heimuer.xyz/api.php/provide/vod/",
            },
            {
              title: "虾米资源",
              value: "https://gctf.tfdh.top/api.php/provide/vod/",
            },
            {
              title: "魔抓资源",
              value: "https://mozhuazy.com/api.php/provide/vod/",
            },
            {
              title: "无尽资源",
              value: "https://api.wujinapi.me/api.php/provide/vod/",
            },
          ],
        },
        {
          name: "t",
          title: "类别ID",
          type: "input",
          description: "视频分类ID (可留空)",
          value: "",
        },
        {
          name: "pg",
          title: "页码",
          type: "page",
          value: "1",
        },
        {
          name: "h",
          title: "最近几小时内",
          type: "input",
          description: "获取最近几小时内更新的内容 (例如: 24，可留空)",
          value: "",
        },
      ],
    },
    {
      title: "搜索视频",
      description: "通过关键词搜索视频",
      requiresWebView: false,
      functionName: "searchVod",
      params: [
        {
          name: "apiUrl",
          title: "视频源地址",
          type: "input",
          description:
            "当前仅支持苹果CMS的JSON API地址 (例如: https://example.com/api.php/provide/vod/)",
          value: "https://api.wwzy.tv/api.php/provide/vod/",
        },
        {
          name: "wd",
          title: "关键词",
          type: "input",
          description: "搜索的关键词",
          value: "",
        },
        {
          name: "pg",
          title: "页码",
          type: "page",
          value: "1",
        },
      ],
    },
    {
      title: "根据电影名搜索",
      description: "输入电影名称关键词搜索视频资源。",
      requiresWebView: false,
      functionName: "searchVodByTitle",
      params: [
        {
          name: "apiUrl",
          title: "视频源地址",
          type: "input",
          description:
            "当前仅支持苹果CMS的JSON API地址 (例如: https://example.com/api.php/provide/vod/)",
          value: "https://api.wwzy.tv/api.php/provide/vod/",
        },
        {
          name: "title",
          title: "电影名称",
          type: "input",
          description: "输入要搜索的电影关键词",
          value: "",
        },
        {
          name: "pg",
          title: "页码",
          type: "page",
          value: "1",
        },
      ],
    },
  ],
  search: {
    title: "搜索视频",
    functionName: "searchVod",
    params: [
      {
        name: "apiUrl",
        title: "视频源地址",
        type: "input",
        description:
          "当前仅支持苹果CMS的JSON API地址 (例如: https://example.com/api.php/provide/vod/)",
        value: "https://api.wwzy.tv/api.php/provide/vod/",
      },
      {
        name: "wd",
        title: "关键词",
        type: "input",
        description: "搜索的关键词",
        value: "",
      },
      {
        name: "pg",
        title: "页码",
        type: "page",
        value: "1",
      },
    ],
  },
};

// API基础URL
var apiBaseUrl = "";

/**
 * 构建请求URL
 */
function buildRequestUrl(baseUrl, queryParams = {}) {
  let finalUrl = baseUrl;
  let firstParam = true;

  if (!finalUrl.endsWith("/") && !finalUrl.includes("?")) {
    const schemeIndex = finalUrl.indexOf("://");
    const pathPart =
      schemeIndex !== -1 ? finalUrl.substring(schemeIndex + 3) : finalUrl;
    if (
      !pathPart.includes(".") ||
      pathPart.substring(pathPart.lastIndexOf(".")).length > 5
    ) {
      finalUrl += "/";
    }
  }

  if (finalUrl.includes("?")) {
    firstParam = false;
  }

  for (const key in queryParams) {
    if (queryParams.hasOwnProperty(key)) {
      const value = queryParams[key];
      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        if (firstParam) {
          finalUrl += "?";
          firstParam = false;
        } else {
          finalUrl += "&";
        }
        finalUrl += `${encodeURIComponent(key)}=${encodeURIComponent(
          String(value)
        )}`;
      }
    }
  }
  return finalUrl;
}

/**
 * 解析接口视频数据
 */
function parseItemFromListApi(apiVideoData) {
  const numericalVodId = String(apiVideoData.vod_id);
  const detailPageApiUrl = buildRequestUrl(apiBaseUrl, {
    ac: "detail",
    ids: numericalVodId,
  });

  let mediaType = "movie";
  if (apiVideoData.type_name) {
    const typeName = String(apiVideoData.type_name).toLowerCase();
    if (
      typeName.includes("剧") ||
      typeName.includes("电视") ||
      typeName.includes("连续") ||
      typeName.includes("系列") ||
      typeName.includes("动漫")
    ) {
      mediaType = "tv";
    }
  }

  if (
    apiVideoData.vod_remarks &&
    String(apiVideoData.vod_remarks).match(/第(\d+|全)集/) &&
    mediaType === "movie"
  ) {
    mediaType = "tv";
  }

  return {
    id: detailPageApiUrl,
    type: "url",
    title: apiVideoData.vod_name || "未知标题",
    posterPath: apiVideoData.vod_pic,
    backdropPath: apiVideoData.vod_pic_slide || apiVideoData.vod_pic,
    releaseDate: apiVideoData.vod_time,
    mediaType: mediaType,
    genreTitle: apiVideoData.type_name,
    description:
      apiVideoData.vod_blurb ||
      apiVideoData.vod_remarks ||
      apiVideoData.vod_content,
    link: detailPageApiUrl,
  };
}

/**
 * 根据电影名称搜索视频
 */
async function searchVodByTitle(params = {}) {
  const apiUrl = params.apiUrl;
  if (!apiUrl || String(apiUrl).trim() === "") {
    throw new Error("API源地址 (apiUrl) 不能为空");
  }
  apiBaseUrl = apiUrl.trim();

  const keyword = params.title;
  if (!keyword || String(keyword).trim() === "") {
    throw new Error("电影名称 (title) 不能为空");
  }

  const queryParams = {
    ac: "videolist",
    wd: keyword,
    pg: params.pg,
  };

  const requestUrl = buildRequestUrl(apiBaseUrl, queryParams);
  console.log(`searchVodByTitle: 请求VOD搜索API: ${requestUrl}`);

  try {
    const response = await Widget.http.get(requestUrl);
    const data = response.data;

    if (!data) {
      console.error("searchVodByTitle: API搜索失败，未收到任何数据。URL:", requestUrl);
      throw new Error("API搜索失败: 未收到任何数据。");
    }
    if (data.code !== 1) {
      const errorMsg = data.msg || "未知API错误";
      console.error(
        "searchVodByTitle: API搜索返回错误:",
        errorMsg,
        "响应代码:",
        data.code
      );
      throw new Error(`API搜索失败: ${errorMsg} (code: ${data.code})`);
    }

    if (data.list && Array.isArray(data.list)) {
      const resultList = data.list.map((apiItem) =>
        parseItemFromListApi(apiItem)
      );
      console.log(`searchVodByTitle: 成功解析 ${resultList.length} 个搜索结果。`);
      return resultList;
    } else {
      console.warn(
        "searchVodByTitle: API搜索返回的视频列表 'list' 为空或格式不正确。",
        data
      );
      return [];
    }
  } catch (error) {
    console.error(
      `searchVodByTitle: 搜索视频时发生错误 (${requestUrl}):`,
      error.message,
      error.stack
    );
    throw new Error(`搜索视频失败: ${error.message}.`);
  }
}
