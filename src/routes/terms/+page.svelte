<script lang="ts">
  import LegalPage from '$lib/components/LegalPage.svelte';

  const sections = [
    { title: 'Acceptance of Terms', body: 'By accessing and using the VOIDHAUS website and purchasing products, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use this website.' },
    { title: 'Products & Pricing', body: 'All products are subject to availability. Prices are in euros and include applicable VAT where required. VOIDHAUS reserves the right to change prices without prior notice. Product images are representative; variations in material and finish are inherent to handmade production.' },
    { title: 'Orders & Payment', body: 'By placing an order, you offer to purchase a product. We reserve the right to refuse any order. Payment is processed securely via our payment provider. Your card will be charged at the time of order confirmation.' },
    { title: 'Shipping & Delivery', body: 'We ship worldwide. Estimated delivery times are 5–10 business days for standard orders. Duties and taxes may apply depending on your jurisdiction and are the responsibility of the recipient.' },
    { title: 'Returns & Refunds', body: 'You may return unworn items within 14 days of receipt for a full refund. Items must be in original packaging with all tags attached. Made-to-order and personalised items are non-refundable. Contact studio@voidhaus.com to initiate a return.' },
    { title: 'Intellectual Property', body: 'All content on this website — including text, images, logos, and design — is the property of VOIDHAUS S.r.l. and is protected by intellectual property laws. Unauthorised use is prohibited.' },
    { title: 'Limitation of Liability', body: 'To the maximum extent permitted by law, VOIDHAUS shall not be liable for any indirect, incidental, or consequential damages arising from the use of this website or our products.' },
    { title: 'Governing Law', body: 'These terms are governed by Italian law. Any disputes shall be subject to the exclusive jurisdiction of the courts of Milan, Italy.' },
  ];
</script>

<LegalPage
  title="Terms & Conditions — VOIDHAUS"
  description={sections[0]?.body ?? ""}
  updated="June 2026"
  sibling={{ href: '/privacy', label: 'Privacy Policy' }}
  {sections}
/>