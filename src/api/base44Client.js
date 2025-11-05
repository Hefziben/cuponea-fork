// src/api/base44Client.js (o src/api/base44ClientMock.js)

// Simula la base de datos con datos de prueba
const mockDb = {
  users: [
    {
      id: "user-123",
      full_name: "John Doe",
      email: "john.doe@example.com",
      account_type: "user", // or 'business', 'cuponeador'
      profile_complete: true,
      subscription_plan: "none",
      subscription_active: false,
      video_coupon_credits: 3,
      video_coupons_used: 0,
      current_role: "user", // For mock purposes
      role_status: "active", // For mock purposes
      solidary_points: 150, // For mock purposes
      cuponeador_level: "bronce", // For mock purposes
      business_name: "Mi Negocio de Prueba", // If account_type is business
      business_category: "restaurants", // If account_type is business
      // ... more user fields
    },
    {
      id: "business-456",
      full_name: "Business Owner",
      email: "business@example.com",
      account_type: "business",
      profile_complete: true,
      subscription_plan: "avanzado", // or 'pro', 'freemium'
      subscription_active: true,
      video_coupon_credits: 3, // Initial for all
      video_coupons_used: 1, // Example usage
      business_name: "La Pizza Local",
      business_description: "Las mejores pizzas de la ciudad.",
      business_category: "restaurants",
      business_address: "Calle Falsa 123, Ciudad",
      business_phone: "+50712345678",
      business_whatsapp: "+50712345678",
    },
    {
      id: "cuponeador-789",
      full_name: "Jane Cuponeadora",
      email: "jane.c@example.com",
      account_type: "cuponeador",
      profile_complete: true,
      cuponeador_code: "CUPJANE",
      clients_registered: 5,
      clients_this_month: 2,
      level: "plata",
      // ... more cuponeador user fields
    },
  ],
  coupons: [
    {
      id: "coupon-1",
      business_id: "business-456",
      title: "20% OFF en Pizzas Grandes",
      description: "Válido para llevar o delivery. No aplica con otras promociones.",
      discount_type: "percentage",
      discount_value: 20,
      category: "restaurants",
      image_url: "https://images.unsplash.com/photo-1513104880461-5d6360c7edcd?q=80&w=2070&auto=format&fit=crop",
      terms_conditions: "Válido de Lunes a Viernes. Mínimo de compra $15.",
      valid_from: "2023-01-01",
      valid_until: "2025-12-31",
      max_uses: 100,
      current_uses: 15,
      qr_code: "QR-PIZZA-1",
      is_active: true,
      is_featured: true,
      enable_sharing: true,
      ai_performance_score: 90,
    },
    {
      id: "coupon-2",
      business_id: "business-456",
      title: "Café Gratis con tu Desayuno",
      description: "Disfruta de un café americano gratis al ordenar cualquier desayuno.",
      discount_type: "gift",
      discount_value: 0,
      category: "restaurants",
      image_url: "https://images.unsplash.com/photo-1504754528070-ad0321920dce?q=80&w=2070&auto=format&fit=crop",
      terms_conditions: "Solo para consumo en local.",
      valid_from: "2024-01-01",
      valid_until: "2025-06-30",
      max_uses: 50,
      current_uses: 5,
      qr_code: "QR-COFFEE-2",
      is_active: true,
      is_featured: false,
      enable_sharing: false,
      ai_performance_score: 75,
    },
    // Add more mock coupons as needed
  ],
  businesses: [
    {
      id: "business-456",
      name: "La Pizza Local",
      description: "Las mejores pizzas de la ciudad.",
      category: "restaurants",
      address: "Calle Falsa 123, Ciudad",
      phone: "+50712345678",
      whatsapp: "+50712345678",
      logo_url: "https://via.placeholder.com/50/FF6347/FFFFFF?text=PL",
      plan: "avanzado",
      is_active: true,
    },
    // Add more mock businesses
  ],
  savedCoupons: [], // Populate if needed
  prospects: [
    {
      id: "prospect-1",
      cuponeador_id: "cuponeador-789",
      business_name: "Florería Rosas",
      address: "Av. Siempre Viva 742",
      phone: "+50761234567",
      contact_person: "Homero Simpson",
      business_type: "floristeria",
      photo_url: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae74?q=80&w=2070&auto=format&fit=crop",
      notes: "Interesado en atraer clientes para San Valentín. Llamar Lunes.",
      status: "interested",
      next_action: "Enviar propuesta por email",
      lat: 9.00,
      lng: -79.50,
    },
  ],
  cuponeadores: [
    {
      id: "cuponeador-db-789", // This ID would be for the Cuponeador entity, not the user
      user_id: "cuponeador-789",
      cuponeador_code: "CUPJANE",
      total_commissions: 150,
      pending_commissions: 30,
      clients_registered: 5,
      active_clients: 4,
      clients_this_month: 2,
      level: "plata",
    },
  ],
  payments: [],
  videoCoupons: [],
  videoInteractions: [],
  gameCommissions: [],
  userPreferences: [],
};

// --- Utility functions for mocking ---
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));
const generateId = () => `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const findEntity = (entityName, query) => {
  let results = mockDb[entityName.toLowerCase()];
  if (query) {
    for (const key in query) {
      results = results.filter(item => item[key] == query[key]);
    }
  }
  return results;
};

// --- Mocked base44 client ---
export const base44 = {
  auth: {
    me: async () => {
      await simulateDelay();
      // Returns a predefined mock user for testing authentication
      // You can change 'user-123' to 'business-456' or 'cuponeador-789' to test different roles
      const mockUser = mockDb.users.find(u => u.id === "user-123");
      if (!mockUser) throw new Error("Mock user not found.");
      return mockUser;
    },
    login: async () => {
      await simulateDelay();
      console.log("Mock: Simulating login...");
      // In a real app, this would redirect. Here we just log.
      alert("Mock: Login successful!");
    },
    updateMe: async (data) => {
      await simulateDelay();
      console.log("Mock: Updating current user data:", data);
      const currentUser = mockDb.users.find(u => u.id === "user-123"); // Assuming user-123 is logged in
      if (currentUser) {
        Object.assign(currentUser, data);
        console.log("Mock: User updated:", currentUser);
      }
      return currentUser;
    },
    logout: async () => {
      await simulateDelay();
      console.log("Mock: Simulating logout...");
      alert("Mock: Logout successful!");
    },
    isAuthenticated: async () => {
      await simulateDelay();
      // Always returns true for mock for simplicity
      return true;
    },
    redirectToLogin: async () => {
      await simulateDelay();
      console.log("Mock: Simulating redirect to login.");
    },
  },
  entities: {
    // Generic entity methods (can be extended for each specific entity)
    async list(entityName, sort = null, limit = 50) {
      await simulateDelay();
      let results = [...mockDb[entityName.toLowerCase()]]; // Copy to avoid direct mutation
      if (sort) {
        // Simple sort logic: assumes string like "-created_date" or "name"
        const sortKey = sort.startsWith('-') ? sort.substring(1) : sort;
        const ascending = !sort.startsWith('-');
        results.sort((a, b) => {
          if (a[sortKey] < b[sortKey]) return ascending ? -1 : 1;
          if (a[sortKey] > b[sortKey]) return ascending ? 1 : -1;
          return 0;
        });
      }
      return results.slice(0, limit);
    },
    async filter(entityName, query = {}, sort = null, limit = 50) {
      await simulateDelay();
      let results = findEntity(entityName, query);
      // Apply sort and limit from generic list method
      return await this.list(entityName, sort, limit, results);
    },
    async create(entityName, data) {
      await simulateDelay();
      const newEntity = { id: generateId(), created_date: new Date().toISOString(), updated_date: new Date().toISOString(), ...data };
      mockDb[entityName.toLowerCase()].push(newEntity);
      console.log(`Mock: Created ${entityName}:`, newEntity);
      return newEntity;
    },
    async update(entityName, id, data) {
      await simulateDelay();
      const entityList = mockDb[entityName.toLowerCase()];
      const index = entityList.findIndex(e => e.id === id);
      if (index > -1) {
        entityList[index] = { ...entityList[index], ...data, updated_date: new Date().toISOString() };
        console.log(`Mock: Updated ${entityName} ${id}:`, entityList[index]);
        return entityList[index];
      }
      throw new Error(`Mock: ${entityName} with id ${id} not found for update.`);
    },
    async delete(entityName, id) {
      await simulateDelay();
      const entityList = mockDb[entityName.toLowerCase()];
      const initialLength = entityList.length;
      mockDb[entityName.toLowerCase()] = entityList.filter(e => e.id !== id);
      if (mockDb[entityName.toLowerCase()].length < initialLength) {
        console.log(`Mock: Deleted ${entityName} ${id}`);
        return { success: true };
      }
      throw new Error(`Mock: ${entityName} with id ${id} not found for deletion.`);
    },
    async bulkCreate(entityName, dataArray) {
        await simulateDelay();
        const newEntities = dataArray.map(data => ({ id: generateId(), created_date: new Date().toISOString(), updated_date: new Date().toISOString(), ...data }));
        mockDb[entityName.toLowerCase()].push(...newEntities);
        console.log(`Mock: Bulk created ${entityName}s:`, newEntities);
        return newEntities;
    },
    async schema(entityName) {
        await simulateDelay();
        // In a real app, this would fetch the schema. Here, we return a simple mock.
        console.log(`Mock: Returning mock schema for ${entityName}`);
        return {
            type: "object",
            properties: { /* simplified mock properties */ },
        };
    },

    // Specific entity wrappers for convenience
    User: {
        list: (sort, limit) => base44.entities.list('User', sort, limit),
        filter: (query, sort, limit) => base44.entities.filter('User', query, sort, limit),
        create: (data) => base44.entities.create('User', data),
        update: (id, data) => base44.entities.update('User', id, data),
        delete: (id) => base44.entities.delete('User', id),
        schema: () => base44.entities.schema('User'),
    },
    Coupon: {
        list: (sort, limit) => base44.entities.list('Coupon', sort, limit),
        filter: (query, sort, limit) => base44.entities.filter('Coupon', query, sort, limit),
        create: (data) => base44.entities.create('Coupon', data),
        update: (id, data) => base44.entities.update('Coupon', id, data),
        delete: (id) => base44.entities.delete('Coupon', id),
        schema: () => base44.entities.schema('Coupon'),
    },
    Business: {
        list: (sort, limit) => base44.entities.list('Business', sort, limit),
        filter: (query, sort, limit) => base44.entities.filter('Business', query, sort, limit),
        create: (data) => base44.entities.create('Business', data),
        update: (id, data) => base44.entities.update('Business', id, data),
        delete: (id) => base44.entities.delete('Business', id),
        schema: () => base44.entities.schema('Business'),
    },
    SavedCoupon: {
        list: (sort, limit) => base44.entities.list('SavedCoupon', sort, limit),
        filter: (query, sort, limit) => base44.entities.filter('SavedCoupon', query, sort, limit),
        create: (data) => base44.entities.create('SavedCoupon', data),
        update: (id, data) => base44.entities.update('SavedCoupon', id, data),
        delete: (id) => base44.entities.delete('SavedCoupon', id),
        schema: () => base44.entities.schema('SavedCoupon'),
    },
    Prospect: {
        list: (sort, limit) => base44.entities.list('Prospect', sort, limit),
        filter: (query, sort, limit) => base44.entities.filter('Prospect', query, sort, limit),
        create: (data) => base44.entities.create('Prospect', data),
        update: (id, data) => base44.entities.update('Prospect', id, data),
        delete: (id) => base44.entities.delete('Prospect', id),
        schema: () => base44.entities.schema('Prospect'),
    },
    Cuponeador: {
        list: (sort, limit) => base44.entities.list('Cuponeador', sort, limit),
        filter: (query, sort, limit) => base44.entities.filter('Cuponeador', query, sort, limit),
        create: (data) => base44.entities.create('Cuponeador', data),
        update: (id, data) => base44.entities.update('Cuponeador', id, data),
        delete: (id) => base44.entities.delete('Cuponeador', id),
        schema: () => base44.entities.schema('Cuponeador'),
    },
    Payment: {
        list: (sort, limit) => base44.entities.list('Payment', sort, limit),
        filter: (query, sort, limit) => base44.entities.filter('Payment', query, sort, limit),
        create: (data) => base44.entities.create('Payment', data),
        update: (id, data) => base44.entities.update('Payment', id, data),
        delete: (id) => base44.entities.delete('Payment', id),
        schema: () => base44.entities.schema('Payment'),
    },
    VideoCoupon: {
        list: (sort, limit) => base44.entities.list('VideoCoupon', sort, limit),
        filter: (query, sort, limit) => base44.entities.filter('VideoCoupon', query, sort, limit),
        create: (data) => base44.entities.create('VideoCoupon', data),
        update: (id, data) => base44.entities.update('VideoCoupon', id, data),
        delete: (id) => base44.entities.delete('VideoCoupon', id),
        schema: () => base44.entities.schema('VideoCoupon'),
    },
    VideoInteraction: {
        list: (sort, limit) => base44.entities.list('VideoInteraction', sort, limit),
        filter: (query, sort, limit) => base44.entities.filter('VideoInteraction', query, sort, limit),
        create: (data) => base44.entities.create('VideoInteraction', data),
        update: (id, data) => base44.entities.update('VideoInteraction', id, data),
        delete: (id) => base44.entities.delete('VideoInteraction', id),
        schema: () => base44.entities.schema('VideoInteraction'),
    },
    GameCommission: {
        list: (sort, limit) => base44.entities.list('GameCommission', sort, limit),
        filter: (query, sort, limit) => base44.entities.filter('GameCommission', query, sort, limit),
        create: (data) => base44.entities.create('GameCommission', data),
        update: (id, data) => base44.entities.update('GameCommission', id, data),
        delete: (id) => base44.entities.delete('GameCommission', id),
        schema: () => base44.entities.schema('GameCommission'),
    },
    UserPreference: {
        list: (sort, limit) => base44.entities.list('UserPreference', sort, limit),
        filter: (query, sort, limit) => base44.entities.filter('UserPreference', query, sort, limit),
        create: (data) => base44.entities.create('UserPreference', data),
        update: (id, data) => base44.entities.update('UserPreference', id, data),
        delete: (id) => base44.entities.delete('UserPreference', id),
        schema: () => base44.entities.schema('UserPreference'),
    },
  },
  integrations: {
    Core: {
      InvokeLLM: async ({ prompt, response_json_schema }) => {
        await simulateDelay();
        console.log("Mock: InvokeLLM with prompt:", prompt);
        // Basic AI response simulation
        if (response_json_schema) {
          return { "mock_response": "This is a structured AI response from mock." };
        }
        return `Mock AI response to: "${prompt.substring(0, 50)}..."`;
      },
      SendEmail: async ({ to, subject, body, from_name }) => {
        await simulateDelay();
        console.log(`Mock: Sending email to ${to} with subject "${subject}" from ${from_name || 'Cuponea'}. Body snippet: "${body.substring(0, 100)}..."`);
        return { success: true, message: "Mock email sent." };
      },
      UploadFile: async ({ file }) => {
        await simulateDelay();
        console.log("Mock: Uploading file:", file.name);
        return { file_url: `https://mock.base44.com/files/${file.name}` };
      },
      GenerateImage: async ({ prompt }) => {
        await simulateDelay();
        console.log("Mock: Generating image for prompt:", prompt);
        return { url: "https://images.unsplash.com/photo-1575936123452-b67c3203c357?q=80&w=2070&auto=format&fit=crop" }; // Generic image
      },
      ExtractDataFromUploadedFile: async ({ file_url, json_schema }) => {
        await simulateDelay();
        console.log("Mock: Extracting data from file:", file_url, "with schema:", json_schema);
        return { status: "success", output: [{ mock_data: "extracted" }] };
      },
      CreateFileSignedUrl: async ({ file_uri, expires_in }) => {
        await simulateDelay();
        console.log("Mock: Creating signed URL for:", file_uri);
        return { signed_url: `https://mock.base44.com/signed/${file_uri}?expires=${expires_in}` };
      },
      UploadPrivateFile: async ({ file }) => {
        await simulateDelay();
        console.log("Mock: Uploading private file:", file.name);
        return { file_uri: `private/mock-files/${file.name}` };
      },
    }
  }
};