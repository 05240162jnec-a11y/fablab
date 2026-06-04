<?php

namespace App\Console\Commands;

use App\Models\ProductOrder;
use App\Models\Product;
use App\Mail\OrderDeadlineExpiredMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class ProcessExpiredProductOrders extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'orders:process-expired';

    /**
     * The console command description.
     */
    protected $description = 'Process expired rejected orders: return stock, mark as permanently rejected, and send emails';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for expired product orders...');

        // Find all rejected orders where the deadline has passed and they aren't permanently rejected yet
        $expiredOrders = ProductOrder::where('status', 'rejected')
            ->where('permanently_rejected', false)
            ->where('rejection_deadline', '<', now())
            ->get();

        if ($expiredOrders->isEmpty()) {
            $this->info('No expired orders found.');
            return;
        }

        $this->info("Found {$expiredOrders->count()} expired order(s). Processing...");

        $processedCount = 0;

        foreach ($expiredOrders as $order) {
            try {
                // 1. Return stock to products
                foreach ($order->items as $item) {
                    $product = Product::find($item['id']);
                    if ($product) {
                        $product->increment('stock', $item['quantity']);
                    }
                }

                // 2. Mark order as permanently rejected
                $order->update([
                    'permanently_rejected' => true,
                ]);

                // 3. Send email notification to the user
                if ($order->user && $order->user->email) {
                    Mail::to($order->user->email)
                        ->send(new OrderDeadlineExpiredMail($order));
                }

                $processedCount++;
                $this->info("✅ Processed Order #{$order->order_number}");

            } catch (\Exception $e) {
                Log::error("Failed to process expired order {$order->id}: " . $e->getMessage());
                $this->error("❌ Failed to process Order #{$order->order_number}");
            }
        }

        $this->info("Successfully processed {$processedCount} order(s).");
    }
}