self.addEventListener("fetch", function (event) {
        if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") {
                return;
        }

        event.respondWith(
                fetch(event.request)
                .then(function (response) {
                        const newHeaders = new Headers(response.headers);
                        newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
                        newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");

                        const responseClone = response.clone();

                        return new Response(responseClone.body, {
                                status: response.status,
                                statusText: response.statusText,
                                headers: newHeaders,
                        });
                })
                .catch(function (error) {
                        console.error("Fetch failed: ", error);

                        return new Response("An error occurred.", {
                                status: 500,
                                statusText: "Internal Server Error",
                                headers: {
                                        "Content-Type": "text/plain",
                                },
                        });
                })
        );
});

