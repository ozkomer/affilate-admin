import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create profile (singleton pattern - only one profile)
    let profile = await prisma.userProfile.findFirst();

    if (!profile) {
      // Create default profile if it doesn't exist
      profile = await prisma.userProfile.create({
        data: {
          name: "Enes Özen",
          bio: "Teknoloji tutkunu, içerik üreticisi ve en iyi fırsat avcısı.",
          profileImageUrl: "https://yt3.googleusercontent.com/0JmZ86WmvyvkZYLZggr8BBwZanH5TLJFrBQaaujNbHbGxoPWXGQydEk8Yie3MTXCeh9j1qc5KA=s160-c-k-c0x00ffffff-no-rj",
          attentionText: "Gerçek indirim ve fırsatları kaçırmamak için indirim kanallarını takip etmeyi unutma!",
          instagramUrl: "https://instagram.com",
          youtubeUrl: "https://youtube.com",
          tiktokUrl: "https://tiktok.com",
          whatsappUrl: "https://whatsapp.com",
          telegramUrl: "https://t.me",
        },
      });
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile", details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      bio,
      profileImageUrl,
      attentionText,
      instagramUrl,
      youtubeUrl,
      tiktokUrl,
      whatsappUrl,
      telegramUrl,
    } = body;

    // Get existing profile or create new one
    let profile = await prisma.userProfile.findFirst();

    if (profile) {
      // Update existing profile
      profile = await prisma.userProfile.update({
        where: { id: profile.id },
        data: {
          name: name !== undefined ? name : profile.name,
          bio: bio !== undefined ? bio : profile.bio,
          profileImageUrl: profileImageUrl !== undefined ? profileImageUrl : profile.profileImageUrl,
          attentionText: attentionText !== undefined ? attentionText : profile.attentionText,
          instagramUrl: instagramUrl !== undefined ? instagramUrl : profile.instagramUrl,
          youtubeUrl: youtubeUrl !== undefined ? youtubeUrl : profile.youtubeUrl,
          tiktokUrl: tiktokUrl !== undefined ? tiktokUrl : profile.tiktokUrl,
          whatsappUrl: whatsappUrl !== undefined ? whatsappUrl : profile.whatsappUrl,
          telegramUrl: telegramUrl !== undefined ? telegramUrl : profile.telegramUrl,
        },
      });
    } else {
      // Create new profile
      profile = await prisma.userProfile.create({
        data: {
          name: name || "Enes Özen",
          bio: bio || null,
          profileImageUrl: profileImageUrl || null,
          attentionText: attentionText || null,
          instagramUrl: instagramUrl || null,
          youtubeUrl: youtubeUrl || null,
          tiktokUrl: tiktokUrl || null,
          whatsappUrl: whatsappUrl || null,
          telegramUrl: telegramUrl || null,
        },
      });
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile", details: error.message },
      { status: 500 }
    );
  }
}




