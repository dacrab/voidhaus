<script lang="ts">
  import LegalPage from '$lib/components/LegalPage.svelte';

  const sections = [
    { title: 'Data Controller', body: 'VOIDHAUS S.r.l., Via della Spiga 19, 20121 Milan, Italy, is the data controller for the purposes of the EU General Data Protection Regulation (GDPR).' },
    { title: 'Data We Collect', body: 'We collect personal data that you provide directly: name, email address, shipping address, payment information, and any communications you send us. We also collect usage data automatically, including pages visited, time spent, device type, and browser information.' },
    { title: 'How We Use Your Data', body: 'Your data is used to process orders, provide customer service, personalise your experience, and send communications you have opted into. We do not sell personal data to third parties.' },
    { title: 'Legal Basis', body: 'We process your data on the basis of contract performance, legitimate interest, or your explicit consent. You may withdraw consent at any time by contacting studio@voidhaus.com.' },
    { title: 'Cookies', body: 'Our site uses essential cookies for functionality and analytics cookies to understand usage patterns. You may manage cookie preferences through your browser settings.' },
    { title: 'Data Retention', body: 'We retain personal data for as long as necessary to fulfil the purposes outlined, and in accordance with legal obligations. Order data is retained for a minimum of seven years for tax and legal compliance.' },
    { title: 'Your Rights', body: 'You have the right to access, rectify, erase, restrict, or port your personal data. To exercise these rights, contact studio@voidhaus.com. You may also lodge a complaint with the Italian data protection authority (Garante).' },
  ];
</script>

<LegalPage
  title="Privacy Policy — VOIDHAUS"
  description={sections[0].body}
  updated="June 2026"
  sibling={{ href: '/terms', label: 'Terms & Conditions' }}
  {sections}
/>