<?php

namespace App\Http\Controllers;

use App\Models\Issuance;
use App\Support\Media;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class IssuanceFileController extends Controller
{
    /**
     * Stream an issuance file. Internal issuances are only available to
     * signed-in staff; guests get a 404 so their existence is not revealed.
     */
    public function __invoke(Request $request, Issuance $issuance): StreamedResponse
    {
        abort_if($issuance->isInternal() && $request->user() === null, 404);

        $disk = Media::privateDisk();

        abort_unless($disk->exists($issuance->file_path), 404);

        return $disk->response($issuance->file_path, $issuance->file_name, [
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => $issuance->isInternal() ? 'private, no-store' : 'public, max-age=86400',
        ]);
    }
}
