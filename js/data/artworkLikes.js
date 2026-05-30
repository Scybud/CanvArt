import { supabase } from "../supabase.js";

export async function enrichArtworksWithLikes(artworks, userId) {
  
  const artworkIds = artworks.map((a) => a.id);

  const { data: likes } = await supabase
    .from("artwork_likes")
    .select("artwork_id, user_id")
    .in("artwork_id", artworkIds);

  const likedSet = new Set();
  const likeCountMap = {};

  likes?.forEach((like) => {
    likeCountMap[like.artwork_id] = (likeCountMap[like.artwork_id] || 0) + 1;

    if (userId && like.user_id === userId) {
      likedSet.add(like.artwork_id);
    }
  });

  return artworks.map((a) => ({
    ...a,
    like_count: likeCountMap[a.id] || 0,
    is_liked: likedSet.has(a.id),
    
  }));

  if (!userId) {
    return artworks.map((a) => ({
      ...a,
      like_count: likeCountMap[a.id] || 0,
      is_liked: false,
    }));
  }
}
