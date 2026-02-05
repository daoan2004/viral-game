import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PagesService } from './pages.service';

@ApiTags('pages')
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all pages' })
  @ApiResponse({ status: 200, description: 'Return all Facebook Pages' })
  async findAll() {
    const pages = await this.pagesService.findAll();
    return { pages };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get page by ID' })
  @ApiResponse({ status: 200, description: 'Return page by ID' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async findOne(@Param('id') id: string) {
    try {
      const result = await this.pagesService.findOne(id);
      const page = (result as any).page || result; // Handle both {page: ...} and direct return
      
      // Flatten config to top level for frontend compatibility
      const { config, ...pageData } = page as any;
      return {
        ...pageData,
        ...(config || {}), // Spread config fields (shop_patterns, prizes, etc.)
      };
    } catch (error) {
      throw new Error('Page not found');
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new page' })
  @ApiResponse({ status: 201, description: 'Page created successfully' })
  async create(@Body() createPageDto: any) {
    return this.pagesService.create(createPageDto);
  }

  @Put(':id/token')
  @ApiOperation({ summary: 'Update page access token' })
  @ApiResponse({ status: 200, description: 'Token updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async updateToken(
    @Param('id') id: string,
    @Body() body: { access_token: string }
  ) {
    if (!body.access_token || body.access_token.length < 50) {
      throw new Error('Invalid access token');
    }
    return await this.pagesService.updateToken(id, body.access_token);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update page configuration' })
  @ApiResponse({ status: 200, description: 'Page updated successfully' })
  @ApiResponse({ status: 404, description: 'Page not found' })
  async update(@Param('id') id: string, @Body() updatePageDto: any) {
    try {
      return await this.pagesService.update(id, updatePageDto);
    } catch (error) {
           console.error('Error updating page:', error); // Log real error
           throw error; // Rethrow original error (e.g. DB constraint)
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete page' })
  @ApiResponse({ status: 204, description: 'Page deleted successfully' })
  async remove(@Param('id') id: string) {
    try {
      await this.pagesService.remove(id);
    } catch (error) {
      throw new Error('Page not found');
    }
  }
}