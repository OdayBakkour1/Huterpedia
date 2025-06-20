import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MITRE_URL = 'https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json';
const MISP_URL = 'https://raw.githubusercontent.com/MISP/misp-galaxy/main/clusters/threat-actor.json';
const THREATFOX_API_URL = 'https://threatfox-api.abuse.ch/api/v1/';

async function fetchThreatActors(supabase) {
  let articles = [];

  // Fetch from MITRE ATT&CK
  try {
    const mitreResponse = await fetch(MITRE_URL);
    const mitreData = await mitreResponse.json();
    const mitreActors = mitreData.objects.filter(obj => obj.type === 'intrusion-set');
    articles.push(...mitreActors.map(actor => ({
      title: actor.name,
      description: actor.description || 'No description available.',
      url: actor.external_references[0]?.url || MITRE_URL,
      source: 'MITRE ATT&CK',
      category: 'Threat Actors Landscape',
      published_at: new Date(actor.created).toISOString(),
    })));
  } catch (error) {
    console.error('Error fetching MITRE data:', error);
  }

  // Fetch from MISP Threat Actor Galaxy
  try {
    const mispResponse = await fetch(MISP_URL);
    const mispData = await mispResponse.json();
    articles.push(...mispData.values.map(actor => ({
      title: actor.value,
      description: actor.description || 'No description available.',
      url: `https://www.misp-project.org/galaxy.html#_threat_actors`,
      source: 'MISP Threat Actor Galaxy',
      category: 'Threat Actors Landscape',
      published_at: new Date().toISOString(), // MISP data does not have timestamps
    })));
  } catch (error) {
    console.error('Error fetching MISP data:', error);
  }

  // Fetch from ThreatFox
  try {
    const threatfoxResponse = await fetch(THREATFOX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // The user needs to add their own API key to the environment variables
        'API-KEY': Deno.env.get('THREATFOX_API_KEY') || '',
      },
      body: JSON.stringify({
        query: 'get_iocs',
        days: 7,
      }),
    });
    const threatfoxData = await threatfoxResponse.json();
    if (threatfoxData.data) {
      articles.push(...threatfoxData.data.map(ioc => ({
        title: `${ioc.malware_printable} IOC: ${ioc.ioc}`,
        description: ioc.threat_type_desc,
        url: ioc.reference || `https://threatfox.abuse.ch/ioc/${ioc.id}/`,
        source: 'ThreatFox',
        category: 'Threats',
        published_at: new Date(ioc.first_seen).toISOString(),
      })));
    }
  } catch (error) {
    console.error('Error fetching ThreatFox data:', error);
  }

  if (articles.length > 0) {
    const { error } = await supabase.from('news_articles').upsert(articles, {
      onConflict: 'url',
      ignoreDuplicates: true,
    });
    if (error) {
      console.error('Error inserting articles:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
  }

  return new Response(JSON.stringify({ message: `Fetched ${articles.length} total articles.` }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );

  return await fetchThreatActors(supabase);
}); 