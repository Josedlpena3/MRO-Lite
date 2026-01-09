using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace MroLite.Api.Tests
{
    public class TechniciansControllerTests : IClassFixture<TestWebApplicationFactory>
    {
        private readonly HttpClient _client;

        public TechniciansControllerTests(TestWebApplicationFactory factory)
        {
            _client = factory.CreateClient();
        }

        [Fact]
        public async Task CreateAndList_ReturnsTechnicians()
        {
            var createPayload = new { name = "Juan Perez" };
            var createResponse = await _client.PostAsJsonAsync("/technicians", createPayload);

            Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

            var listResponse = await _client.GetAsync("/technicians");
            Assert.Equal(HttpStatusCode.OK, listResponse.StatusCode);

            var json = await listResponse.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            Assert.Equal(JsonValueKind.Array, doc.RootElement.ValueKind);
            Assert.True(doc.RootElement.GetArrayLength() > 0);
        }
    }
}
