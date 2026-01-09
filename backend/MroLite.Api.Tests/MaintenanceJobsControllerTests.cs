using System;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace MroLite.Api.Tests
{
    public class MaintenanceJobsControllerTests : IClassFixture<TestWebApplicationFactory>
    {
        private readonly HttpClient _client;

        public MaintenanceJobsControllerTests(TestWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task GetAll_ReturnsPagedPayload()
        {
            var response = await _client.GetAsync("/maintenancejobs");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            Assert.True(doc.RootElement.TryGetProperty("items", out _));
        }

        [Fact]
        public async Task Patch_CompletadoWithoutNotes_ReturnsBadRequest()
        {
            var createPayload = new
            {
                equipment = "Boeing 737",
                company = "Aerolineas Argentinas",
                plane = "LV-FUA",
                technicianIds = Array.Empty<int>(),
                status = "Pendiente",
                notes = (string?)null,
                anomaly = false
            };

            var createResponse = await _client.PostAsJsonAsync("/maintenancejobs", createPayload);
            Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

            var createdJson = await createResponse.Content.ReadAsStringAsync();
            using var createdDoc = JsonDocument.Parse(createdJson);
            var id = createdDoc.RootElement.GetProperty("id").GetInt32();

            var patchPayload = new { status = "Completado" };
            var patchResponse = await _client.PatchAsync(
                $"/maintenancejobs/{id}/status",
                JsonContent.Create(patchPayload));

            Assert.Equal(HttpStatusCode.BadRequest, patchResponse.StatusCode);
        }
    }
}
