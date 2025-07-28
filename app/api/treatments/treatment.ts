// lib/api/treatment.ts

export async function updateTreatment(data: any) {
    const response = await fetch(`/api/treatment/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error("Failed to update treatment");
    }

    return response.json();
}
