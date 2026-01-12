import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
import bcrypt from 'npm:bcryptjs@2.4.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { username, password, fullName, email, country, subscription_plan } = await req.json();

    if (!username || !password || !fullName || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: 'Username already exists' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingEmail) {
      return new Response(
        JSON.stringify({ error: 'Email already exists' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username,
        password: hashedPassword,
        full_name: fullName,
        email,
        role: 'manager',
        status: 'active',
        country: country || '',
        subscription_plan: subscription_plan || 'starter',
        account_status: 'trial',
        payment_status: 'unpaid',
      })
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Registration failed: ' + error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userData = {
      id: newUser.id,
      username: newUser.username,
      fullName: newUser.full_name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      country: newUser.country,
      account_status: newUser.account_status,
      payment_status: newUser.payment_status,
      subscription_plan: newUser.subscription_plan,
    };

    return new Response(
      JSON.stringify(userData),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});