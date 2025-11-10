export default {
  async register({ strapi }) {
    console.log('✅ Strapi register phase completed');
  },

  async bootstrap({ strapi }) {
    console.log('✅ Strapi started successfully');
  },
};