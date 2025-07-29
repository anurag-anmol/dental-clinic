import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { getCurrentUser } from "@/lib/auth"
import { hasPermission, PERMISSIONS } from "@/lib/permissions"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || !hasPermission(user.role, PERMISSIONS.TREATMENTS_CREATE)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const formData = await request.formData()
        const photo = formData.get("photo") as File
        const treatmentId = formData.get("treatmentId") as string

        if (!photo) {
            return NextResponse.json({ error: "No photo provided" }, { status: 400 })
        }

        if (!treatmentId) {
            return NextResponse.json({ error: "Treatment ID required" }, { status: 400 })
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        if (!validTypes.includes(photo.type)) {
            return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
        }

        // Validate file size (10MB max)
        if (photo.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large" }, { status: 400 })
        }

        // Create upload directory
        const uploadDir = join(process.cwd(), "public", "uploads", "treatments")
        await mkdir(uploadDir, { recursive: true })

        // Generate unique filename
        const timestamp = Date.now()
        const extension = photo.name.split(".").pop()
        const filename = `treatment_${treatmentId}_${timestamp}.${extension}`
        const filepath = join(uploadDir, filename)

        // Save file
        const bytes = await photo.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filepath, buffer)

        // Save to database
        const photoUrl = `/uploads/treatments/${filename}`
        await query("INSERT INTO treatment_photos (treatment_id, photo_url, uploaded_by) VALUES (?, ?, ?)", [
            treatmentId,
            photoUrl,
            user.id,
        ])

        return NextResponse.json({
            success: true,
            photoUrl,
            message: "Photo uploaded successfully",
        })
    } catch (error) {
        console.error("Error uploading photo:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
