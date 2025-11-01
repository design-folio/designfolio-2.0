/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define a default fallback config that can be used when Supabase is unavailable
const FALLBACK_CONTENTFUL_CONFIG = {
  space_id: "qu73jsama0eo",
  access_token: "FcBkwpxFmkI-X_bdtCy_O1gKVsgbYTEqtwg0dYH_goQ",
  environment: "master",
};

const staticAuthor = {
  name: "Shai",
  position: "Founder, Designfolio",
  image: "/lovable-uploads/cf09cbb1-eeda-42a6-b714-976c2dc6a445.png",
};

export async function getContentfulConfig() {
  console.log("Fetching Contentful config...");

  try {
    const { data, error } = await supabase.from("contentful_config").select();

    if (error) {
      console.error("Supabase error:", error);
      console.log("Using fallback Contentful config due to Supabase error");
      return FALLBACK_CONTENTFUL_CONFIG;
    }

    if (
      Array.isArray(data) &&
      data.length > 0 &&
      data[0].space_id &&
      data[0].access_token
    ) {
      const config = data[0];
      return {
        space_id: config.space_id,
        access_token: config.access_token,
        environment: config.environment || "master",
      };
    }

    console.log(
      "No valid Contentful config found in Supabase, using fallback config"
    );
    return FALLBACK_CONTENTFUL_CONFIG;
  } catch (err) {
    console.error("Error fetching Contentful config:", err);
    console.log("Using fallback Contentful config due to exception");
    return FALLBACK_CONTENTFUL_CONFIG;
  }
}

function formatImageUrl(url) {
  if (!url) {
    console.log("No image URL provided, using placeholder");
    return "/placeholder.svg";
  }

  console.log("Original image URL:", url);

  if (url.startsWith("http://") || url.startsWith("https://")) {
    console.log("Using complete URL:", url);
    return url;
  }

  const formattedUrl = url.startsWith("//") ? `https:${url}` : `https:${url}`;
  console.log("Formatted image URL:", formattedUrl);
  return formattedUrl;
}

function findAsset(assetId, assets) {
  return assets.find((asset) => asset.sys.id === assetId);
}

export async function fetchPosts() {
  try {
    const config = await getContentfulConfig();

    const response = await fetch(
      `https://cdn.contentful.com/spaces/${config.space_id}/environments/${config.environment}/entries?content_type=blogPage`,
      {
        headers: {
          Authorization: `Bearer ${config.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Contentful API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      toast.error(
        `Failed to fetch posts: ${response.status} ${response.statusText}`
      );
      throw new Error(
        `Contentful API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Raw Contentful response:", data);

    if (!data.items || !Array.isArray(data.items)) {
      console.error("Invalid response format:", data);
      toast.error("Invalid response format from Contentful");
      return [];
    }

    const assets = data.includes?.Asset || [];
    console.log("Available assets:", assets);

    const posts = data.items
      .map((post) => {
        try {
          if (!post.fields || !post.sys?.id) {
            console.error("Invalid post structure:", post);
            return null;
          }

          const {
            title,
            body,
            thumbnail,
            seoDescription,
            publishedOnDate,
            tags,
            recommendedPosts,
          } = post.fields;

          if (!title) {
            console.error("Missing required fields:", { hasTitle: !!title });
            return null;
          }

          console.log("Processing thumbnail for post:", title);
          console.log("Thumbnail reference:", thumbnail);

          const thumbnailAsset = thumbnail?.sys?.id
            ? findAsset(thumbnail.sys.id, assets)
            : null;
          console.log("Found thumbnail asset:", thumbnailAsset);

          const imageUrl = thumbnailAsset?.fields?.file?.url;
          console.log("Raw image URL:", imageUrl);
          const formattedImageUrl = formatImageUrl(imageUrl);
          console.log("Formatted image URL:", formattedImageUrl);

          // Process recommended posts if they exist
          const recommendedPostIds = recommendedPosts
            ? recommendedPosts.map((post) => post.sys.id)
            : [];

          console.log("Recommended post IDs:", recommendedPostIds);

          return {
            id: post.sys.id,
            title: title,
            excerpt: seoDescription || "",
            content: body?.content || [],
            date: publishedOnDate || new Date().toISOString(),
            image: formattedImageUrl,
            author: staticAuthor,
            slug: post.fields.slug || post.sys.id,
            seoTitle: post.fields.seoTitle || title,
            seoDescription: seoDescription || "",
            tags: tags || [],
            recommendedPostIds: recommendedPostIds,
          };
        } catch (error) {
          console.error("Error processing post:", error);
          return null;
        }
      })
      .filter(Boolean);

    return posts;
  } catch (error) {
    console.error("Error in fetchPosts:", error);
    toast.error("Failed to fetch posts");
    // Return empty array instead of throwing to avoid breaking the UI
    return [];
  }
}

export async function fetchRecommendedPosts(postId) {
  try {
    console.log("Fetching recommended posts for post ID:", postId);
    // First get the current post to extract its recommended post IDs
    const post = await fetchPost(postId);

    if (!post) {
      console.error("Post not found when trying to fetch recommended posts");
      return [];
    }

    console.log("Post recommended post IDs:", post.recommendedPostIds);

    // If no recommended posts are specified, return random posts
    if (!post.recommendedPostIds || post.recommendedPostIds.length === 0) {
      console.log("No recommended posts specified, returning random posts");
      const allPosts = await fetchPosts();
      return allPosts
        .filter((p) => p.id !== postId)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
    }

    // Fetch each recommended post
    const recommendedPostsPromises = post.recommendedPostIds.map((id) =>
      fetchPost(id)
    );
    const recommendedPosts = await Promise.all(recommendedPostsPromises);

    // Filter out any null results
    const validRecommendedPosts = recommendedPosts.filter(Boolean);
    console.log(`Fetched ${validRecommendedPosts.length} recommended posts`);

    return validRecommendedPosts;
  } catch (error) {
    console.error("Error fetching recommended posts:", error);

    // Fallback to random posts
    try {
      console.log("Falling back to random posts");
      const allPosts = await fetchPosts();
      return allPosts
        .filter((p) => p.id !== postId)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
    } catch (fallbackError) {
      console.error("Error in fallback for recommended posts:", fallbackError);
      return [];
    }
  }
}

export async function fetchPost(identifier) {
  try {
    const config = await getContentfulConfig();
    console.log("Fetching post with identifier:", identifier);

    // First try to fetch by slug
    let response = await fetch(
      `https://cdn.contentful.com/spaces/${config.space_id}/environments/${config.environment}/entries?content_type=blogPage&fields.slug=${identifier}`,
      {
        headers: {
          Authorization: `Bearer ${config.access_token}`,
        },
      }
    );

    let data = await response.json();

    // If no entry found by slug, try fetching by ID
    if (!data.items || data.items.length === 0) {
      response = await fetch(
        `https://cdn.contentful.com/spaces/${config.space_id}/environments/${config.environment}/entries/${identifier}`,
        {
          headers: {
            Authorization: `Bearer ${config.access_token}`,
          },
        }
      );
      data = await response.json();
    }

    const entryData = data.items ? data.items[0] : data;

    if (!entryData || !entryData.fields) {
      throw new Error("Post not found");
    }

    // Log the raw fields from Contentful to debug
    console.log("Raw Contentful fields:", entryData.fields);
    console.log("Raw Contentful response data:", data);

    // Check for tags specifically and log them
    if (entryData.fields.tags) {
      console.log("Tags found in raw Contentful data:", entryData.fields.tags);
    } else {
      console.log(
        "No tags field found in Contentful data. Available fields:",
        Object.keys(entryData.fields)
      );
    }

    // Check for recommended posts
    if (entryData.fields.recommendedPosts) {
      console.log(
        "Recommended posts found in Contentful data:",
        entryData.fields.recommendedPosts
      );
    } else {
      console.log("No recommendedPosts field found in Contentful data");
    }

    console.log(
      "SEO Title from Contentful:",
      entryData.fields.seoTitle || entryData.fields.title
    );
    console.log(
      "SEO Description from Contentful:",
      entryData.fields.seoDescription || ""
    );

    const assetIds = [];

    if (entryData.fields?.thumbnail?.sys?.id) {
      assetIds.push(entryData.fields.thumbnail.sys.id);
    }

    if (entryData.fields?.body?.content) {
      entryData.fields.body.content.forEach((node) => {
        if (
          node.nodeType === "embedded-asset-block" &&
          node.data?.target?.sys?.id
        ) {
          assetIds.push(node.data.target.sys.id);
        }
      });
    }

    let assets = [];
    if (assetIds.length > 0) {
      const assetPromises = assetIds.map((assetId) =>
        fetch(
          `https://cdn.contentful.com/spaces/${config.space_id}/environments/${config.environment}/assets/${assetId}`,
          {
            headers: {
              Authorization: `Bearer ${config.access_token}`,
            },
          }
        ).then((res) => res.json())
      );

      const assetsResponses = await Promise.all(assetPromises);
      assets = assetsResponses.filter((asset) => asset.fields);
    }

    // Process tag references to get tag names instead of IDs
    let tagNames = [];

    // Check if tags are reference type (sys.id format)
    if (Array.isArray(entryData.fields.tags)) {
      const tagRefs = entryData.fields.tags;

      // Check if tags are direct strings or references
      if (
        tagRefs.length > 0 &&
        typeof tagRefs[0] === "object" &&
        tagRefs[0]?.sys?.id
      ) {
        console.log("Tags are references, looking for tag entries in includes");
        // Tags are references, look for them in the includes
        if (data.includes && data.includes.Entry) {
          const tagEntries = data.includes.Entry.filter(
            (entry) =>
              entry.sys.type === "Entry" &&
              (entry.sys.contentType?.sys?.id === "tag" ||
                entry.sys.contentType?.sys?.id === "category")
          );

          console.log("Found tag entries:", tagEntries);

          // Map tag references to their actual names
          tagNames = tagRefs.map((tagRef) => {
            const tagEntry = tagEntries.find(
              (entry) => entry.sys.id === tagRef.sys.id
            );
            const tagName =
              tagEntry?.fields?.name ||
              tagEntry?.fields?.title ||
              "Unknown Tag";
            console.log(`Mapped tag ID ${tagRef.sys.id} to name: ${tagName}`);
            return tagName;
          });
        }
      } else {
        // Tags are already strings, use them directly
        console.log("Tags are already string values");
        tagNames = tagRefs;
      }
    } else if (entryData.metadata?.tags) {
      // Check for tags in metadata
      console.log("Tags found in metadata");
      tagNames = entryData.metadata.tags.map((tag) => {
        if (tag.sys?.id) {
          // Try to find the tag name in includes
          if (data.includes && data.includes.Entry) {
            const tagEntry = data.includes.Entry.find(
              (entry) => entry.sys.id === tag.sys.id
            );
            if (tagEntry && (tagEntry.fields.name || tagEntry.fields.title)) {
              return tagEntry.fields.name || tagEntry.fields.title;
            }
          }
          // If not found, use the ID but make it more readable
          return tag.sys.id
            .replace(/-/g, " ")
            .replace(/([A-Z])/g, " $1")
            .trim();
        }
        return tag;
      });
    }

    // If still no tags, check additional fields or add default
    if (tagNames.length === 0) {
      // Check alternative fields
      const possibleTagFields = ["categories", "tag", "category", "keywords"];
      for (const field of possibleTagFields) {
        if (Array.isArray(entryData.fields[field])) {
          tagNames = entryData.fields[field];
          console.log(`Using ${field} for tags:`, tagNames);
          break;
        }
      }

      // If still no tags, add default
      if (tagNames.length === 0) {
        tagNames = ["Blog"];
        console.log('Using default tag "Blog"');
      }
    }

    console.log("Final tag names:", tagNames);

    console.log("Fetched assets:", assets);

    const thumbnailRef = entryData.fields.thumbnail?.sys?.id;
    console.log("Looking for thumbnail with ID:", thumbnailRef);
    const thumbnailAsset = thumbnailRef
      ? assets.find((asset) => asset.sys.id === thumbnailRef)
      : undefined;
    console.log("Found thumbnail asset:", thumbnailAsset);

    const thumbnailUrl = thumbnailAsset?.fields?.file?.url;
    console.log("Raw thumbnail URL:", thumbnailUrl);
    const formattedThumbnailUrl = formatImageUrl(thumbnailUrl);
    console.log("Formatted thumbnail URL:", formattedThumbnailUrl);

    // Process and extract recommended post IDs
    let recommendedPostIds = [];
    if (
      entryData.fields.recommendedPosts &&
      Array.isArray(entryData.fields.recommendedPosts)
    ) {
      console.log(
        "Processing recommended posts:",
        entryData.fields.recommendedPosts
      );

      recommendedPostIds = entryData.fields.recommendedPosts
        .filter((rec) => rec.sys && rec.sys.id)
        .map((rec) => rec.sys.id);

      console.log("Extracted recommended post IDs:", recommendedPostIds);
    }

    const processRichTextContent = (content) => {
      return content.map((node) => {
        if (node.nodeType === "embedded-asset-block") {
          const assetId = node.data?.target?.sys?.id;
          if (!assetId) {
            console.warn("No asset ID found in node:", node);
            return null;
          }

          const asset = assets.find((a) => a.sys.id === assetId);
          if (!asset) {
            console.warn(`Asset not found for ID: ${assetId}`);
            return null;
          }

          return {
            ...node,
            data: {
              target: {
                fields: {
                  file: {
                    url: asset.fields.file.url,
                    details: asset.fields.file.details,
                    fileName: asset.fields.file.fileName,
                    contentType: asset.fields.file.contentType,
                  },
                  title: asset.fields.title,
                },
              },
            },
          };
        }
        if (node.content) {
          return {
            ...node,
            content: processRichTextContent(node.content),
          };
        }
        return node;
      });
    };

    const processedContent = entryData.fields.body?.content
      ? processRichTextContent(entryData.fields.body.content)
      : [];

    const post = {
      id: entryData.sys.id,
      title: entryData.fields.title,
      excerpt: entryData.fields.seoDescription || "",
      content: processedContent,
      date: entryData.fields.publishedOnDate || new Date().toISOString(),
      image: formattedThumbnailUrl,
      author: staticAuthor,
      slug: entryData.fields.slug || entryData.sys.id,
      seoTitle: entryData.fields.seoTitle || entryData.fields.title,
      seoDescription: entryData.fields.seoDescription || "",
      tags: tagNames,
      recommendedPostIds: recommendedPostIds,
    };

    // Log the final post object with all the processed data
    console.log("Final post object with meta data:", {
      title: post.title,
      seoTitle: post.seoTitle,
      excerpt: post.excerpt,
      seoDescription: post.seoDescription,
      tags: post.tags,
      recommendedPostIds: post.recommendedPostIds,
    });

    return post;
  } catch (error) {
    console.error("Error fetching post:", error);
    toast.error("Failed to fetch post");
    throw error;
  }
}
